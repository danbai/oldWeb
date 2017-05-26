'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag } from 'antd'

class CallBack extends Component {
    constructor(props) {
        super(props)
        this.state = {
            callbackList: [],
            disaList: [],
            ivrList: [],
            selectedRowKeys: [],
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
        this._getDisaList()
        this._getIvrList()
        this._getCallBackList()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        browserHistory.push('/call-features/callback/add')
    }
    _delete = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const callbackIndex = record.callback_id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "deleteCallback",
                "callback": callbackIndex
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

                    this._getCallBackList({
                        item_num: pagination.pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'name',
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
         browserHistory.push('/call-features/callback/edit/' + record.callback_id + '/' + record.name)
    }

    _createOptions = (text, record, index) => {
        const { formatMessage } = this.props.intl

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

    _displayOutsidePre = (text, record, index) => {
        if (text !== null) {
            return text
        } else {
            return '--'
        }
    }

    _createDestination = (text, record, index) => {
        const { formatMessage } = this.props.intl
        let destType = formatMessage({ id: "LANG2886" })

        if (text === 'disa') {
            this.state.disaList.map(function(item) {
                if (String(item.disa_id) === record.disa) {
                    destType = item.display_name
                }
            })
        } else if (text === 'ivr') {
            this.state.ivrList.map(function(item) {
                if (item.ivr_id === record.ivr) {
                    destType = item.ivr_name
                }
            })
        }

        let displayDestination = text.toUpperCase() + '--' + destType
        return displayDestination
    }

    _getDisaList = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getDISAList' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let obj = {}
                    let response = res.response || {}
                    let disaList = response.disa || []

                    this.setState({
                        disaList: disaList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getIvrList = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getIVRList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    let ivrList = response.ivr || []

                    this.setState({
                        ivrList: ivrList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getCallBackList = (
        params = {
                item_num: 10,
                sidx: "name",
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
                action: 'listCallback',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const callbackList = response.callback || []
                    const pagination = this.state.pagination
                    pagination.total = res.response.total_item

                    this.setState({
                        loading: false,
                        callbackList: callbackList,
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
        pager.pageSize = pagination.pageSize
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

        this._getCallBackList({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'name',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)

        this.setState({ selectedRowKeys })
    }

    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const columns = [{
                key: 'name',
                dataIndex: 'name',
                title: formatMessage({id: "LANG135"}),
                sorter: true
            }, {
                key: 'outside_pre',
                dataIndex: 'outside_pre',
                title: formatMessage({id: "LANG3824"}),
                render: (text, record, index) => (
                    this._displayOutsidePre(text, record, index)
                )
            }, {
                key: 'sleep_time',
                dataIndex: 'sleep_time',
                title: formatMessage({id: "LANG3747"})
            }, {
                key: 'destination_type',
                dataIndex: 'destination_type',
                title: formatMessage({id: "LANG168"}),
                render: (text, record, index) => (
                    this._createDestination(text, record, index)
                )
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => (
                    this._createOptions(text, record, index)
                )
            }]

        const pagination = {
                total: this.state.callbackList.length,
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
                    1: formatMessage({id: "LANG3741"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG3742"}) }
                    isDisplay='hidden'
                />
                <div className="content">
                    <div className="lite-desc">
                        { formatMessage({id: "LANG3750"}) }
                    </div>
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._add }
                        >
                            { formatMessage({id: "LANG3743"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="name"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        dataSource={ this.state.callbackList }
                        onChange={ this._handleTableChange }
                        showHeader={ !!this.state.callbackList.length }
                        loading={ this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(CallBack)

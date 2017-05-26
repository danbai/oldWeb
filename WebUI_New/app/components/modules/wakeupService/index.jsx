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
window.ucmWakeupAutoRefresh = null

class WakeupService extends Component {
    constructor(props) {
        super(props)
        this.state = {
            accountList: [],
            accountAryObj: {},
            selectedRowName: "",
            selectedRowKeys: [],
            wakeupService: [],
            batchDeleteModalVisible: false,
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {}
        }
    }
    componentDidMount() {
        this._getAccountList()
        this._getWakeupService()
        window.ucmWakeupAutoRefresh = setInterval(this._refreshUCMWakeup, 3000)
    }
    componentWillUnmount() {
        clearInterval(window.ucmWakeupAutoRefresh)
    }
    _refreshUCMWakeup = () => {
        this._getWakeupService({
            item_num: this.state.pagination.pageSize ? this.state.pagination.pageSize : 10,
            page: this.state.pagination.current ? this.state.pagination.current : 1,
            sidx: this.state.sorter.field ? this.state.sorter.field : 'wakeup_index',
            sord: this.state.sorter.order === "descend" ? "desc" : "asc"
        })
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        let confirmContent = ''
        const { formatMessage } = this.props.intl

        confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG880" })}}></span>

        if (!this.state.accountList.length) {
            confirm({
                content: confirmContent,
                onOk() {
                    browserHistory.push('/extension-trunk/extension')
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            browserHistory.push('/value-added-features/wakeupService/add')
        }
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: []
        })
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
                "action": "deleteWakeupSchedule",
                "wakeup_index": record.wakeup_index
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

                    this._getWakeupService({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'wakeup_index',
                        sord: this.state.sorter.order === "descend" ? "desc" : "asc"
                    })
                    this._clearSelectRows()
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
    _deleteBatch = () => {
        let selectedRowName = this.state.selectedRowKeys.join('  ')
        const selectedRowKeys = this.state.selectedRowKeys
        let selectedRowList = []

        this.state.wakeupService.map(function(item) {
            for (let i = 0; i < selectedRowKeys.length; i++) {
                if (selectedRowKeys[i] === item.wakeup_index) {
                    selectedRowList.push(item.wakeup_name)
                }
            }
        })
        selectedRowName = selectedRowList.join('  ')
        this.setState({
            batchDeleteModalVisible: true,
            selectedRowName: selectedRowName
        })
    }
    _deleteBatchCancel = () => {
        this.setState({
            batchDeleteModalVisible: false
        })
    }
    _deleteBatchOk = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)
        this.setState({
            batchDeleteModalVisible: false
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "deleteWakeupSchedule",
                "wakeup_index": this.state.selectedRowKeys.join(',')
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
                    const new_total = old_total - this.state.selectedRowKeys.length
                    const new_total_page = (new_total - this.state.selectedRowKeys.length) / pageSize + 1
                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }
                    pagination.current = current

                    this._getWakeupService({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'wakeup_index',
                        sord: this.state.sorter.order === "descend" ? "desc" : "asc"
                    })
                    this._clearSelectRows()
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
        browserHistory.push('/value-added-features/wakeupService/edit/' + record.wakeup_index + "/" + record.wakeup_name)
    }
    _getAccountList = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getAccountList' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let obj = {}
                    let response = res.response || {}
                    let extension = response.extension || []

                    extension.map(function(item) {
                        obj[item.extension] = item
                    })

                    this.setState({
                        accountAryObj: obj,
                        accountList: extension
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getWakeupService = (
        params = {
                item_num: 10,
                sidx: "wakeup_index",
                sord: "asc",
                page: 1
            }
        ) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listWakeupSchedule',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const wakeupService = response.ucm_wakeup || []
                    const pagination = this.state.pagination
                    pagination.total = res.response.total_item

                    this.setState({
                        wakeupService: wakeupService,
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

        this._getWakeupService({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'wakeup_index',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ selectedRowKeys })
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'wakeup_index',
                dataIndex: 'wakeup_index',
                title: formatMessage({id: "LANG135"}),
                className: "hidden",
                sorter: true
            }, {
                key: 'wakeup_name',
                dataIndex: 'wakeup_name',
                title: formatMessage({id: "LANG135"}),
                sorter: true
            }, {
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG85"}),
                sorter: true
            }, {
                key: 'wakeup_enable',
                dataIndex: 'wakeup_enable',
                title: formatMessage({id: "LANG81"}),
                render: (text, record, index) => {
                    if (text === 1) {
                        return <span>{ formatMessage({id: "LANG5220"}) }</span>
                    } else {
                        return <span>{ formatMessage({id: "LANG5219"}) }</span>
                    }
                },
                sorter: false
            }, {
                key: 'execute_status',
                dataIndex: 'execute_status',
                title: formatMessage({id: "LANG4871"}),
                render: (text, record, index) => {
                    if (text === 'set') {
                        return <span>{ formatMessage({id: "LANG4869"}) }</span>
                    } else if (text === 'executed') {
                        return <span>{ formatMessage({id: "LANG4870"}) }</span>
                    } else {
                        return <span>{ formatMessage({id: "LANG2403"}) }</span>
                    }
                },
                sorter: true
            }, {
                key: 'answer_status',
                dataIndex: 'answer_status',
                title: formatMessage({id: "LANG4862"}),
                render: (text, record, index) => {
                    if (record.execute_status === 'executed') {
                        if (text === 'answered') {
                            return <span>{ formatMessage({id: "LANG4863"}) }</span>
                        } else if (text === 'no_answer') {
                            return <span>{ formatMessage({id: "LANG4864"}) }</span>
                        } else if (text === 'busy') {
                            return <span>{ formatMessage({id: "LANG2237"}) }</span>
                        } else if (text === 'error') {
                            return <span>{ formatMessage({id: "LANG4865"}) }</span>
                        } else {
                            return <span>{ formatMessage({id: "LANG2403"}) }</span>
                        }
                    } else {
                        return <span>{ formatMessage({id: "LANG4948"}) }</span>
                    }
                },
                sorter: true
            }, {
                key: 'custom_date',
                dataIndex: 'custom_date',
                title: formatMessage({id: "LANG203"}),
                render: (text, record, index) => {
                    if (!text) {
                        return <span>{ text }</span>
                    } else if (text.indexOf('-') > -1) {
                        return <span>{ text }</span>
                    } else {
                        const weeklist = text.split(',')
                        const weektmp = []
                        const weektext = weeklist.map(function(item, index) {
                                if (item === '0') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG250"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG250"}) }</span>
                                    }
                                } else if (item === '1') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG251"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG251"}) }</span>
                                    }
                                } else if (item === '2') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG252"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG252"}) }</span>
                                    }
                                } else if (item === '3') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG253"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG253"}) }</span>
                                    }
                                } else if (item === '4') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG254"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG254"}) }</span>
                                    }
                                } else if (item === '5') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG255"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG255"}) }</span>
                                    }
                                } else if (item === '6') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG256"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG256"}) }</span>
                                    }
                                }
                            }
                        )
                        return <span>{ weektext }</span>
                    }
                },
                sorter: false
            }, {
                key: 'time',
                dataIndex: 'time',
                title: formatMessage({id: "LANG247"}),
                sorter: false
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
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) } ></span>
                            </Popconfirm>
                        </div>
                }
            }]
        const pagination = {
                total: this.state.wakeupService.length,
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
                    1: formatMessage({id: "LANG4858"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG4858"}) }
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
                            { formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG4858"}) }) }
                        </Button>
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._deleteBatch }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG3872"}, {0: formatMessage({id: "LANG4858"}) }) }
                        </Button>
                        <Modal
                            onOk={ this._deleteBatchOk }
                            onCancel={ this._deleteBatchCancel }
                            title={ formatMessage({id: "LANG543"}) }
                            okText={ formatMessage({id: "LANG727"}) }
                            cancelText={ formatMessage({id: "LANG726"}) }
                            visible={ this.state.batchDeleteModalVisible }
                        >
                            <span dangerouslySetInnerHTML=
                                {{__html: formatMessage({id: "LANG2710"}, {0: formatMessage({id: "LANG4858"}), 1: this.state.selectedRowName})}}
                            ></span>
                        </Modal>
                    </div>
                    <Table
                        rowKey="wakeup_index"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.wakeupService }
                        showHeader={ !!this.state.wakeupService.length }
                        onChange={ this._handleTableChange }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(WakeupService)

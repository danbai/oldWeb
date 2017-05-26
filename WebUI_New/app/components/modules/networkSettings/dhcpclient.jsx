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

class DHCPClient extends Component {
    constructor(props) {
        super(props)
        this.state = {
            DHCPClientList: [],
            selectedRowKeys: [],
            selectedRows: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {
                field: "mac",
                order: "asc"
            },
            loading: false
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _add = () => {
        const { formatMessage } = this.props.intl
        const dhcpEnable = this.props.dataDHCPEnable

        if (dhcpEnable === false) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5034"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            browserHistory.push('/system-settings/networkSettings/dhcpClient/add')
        }
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: [],
            selectedRow: []
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
                "action": "deleteDHCPClient",
                "mac": record.mac
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
                    const new_total_page = Math.floor((new_total - 1) / 10) + 1
                    if (current > new_total_page) {
                        current = new_total_page
                    }
                    pagination.current = current

                    this._getInitData({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'mac',
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
 
    _edit = (record, index) => {
        browserHistory.push('/system-settings/networkSettings/dhcpClient/edit/' + record.mac + '/' + record.ip + '/' + record.isbind)
    }
    _getInitData = (
        params = {
            item_num: 10,
            sidx: "mac",
            sord: "asc",
            page: 1
        }) => {
        this.setState({ loading: true })
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listDHCPClient',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const DHCPClientList = response.dhcp_client_list || []
                    const pagination = this.state.pagination

                    pagination.total = response.total_item
                    this.setState({
                        loading: false,
                        DHCPClientList: DHCPClientList,
                        pagination: pagination
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
    _batchadd = () => {
        const { formatMessage } = this.props.intl
        const dhcpEnable = this.props.dataDHCPEnable

        if (dhcpEnable === false) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5034"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            this._bindAddDel('addBatchDHCPClient', 'yes', 'LANG4689')
        }
    }
    _batchdelete= () => {
        this._bindAddDel('deleteBatchDHCPClient', 'no', 'LANG5068')
    }
    _bindAddDel = (sAction, isbind, sMacInfo) => {
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
                                {{__html: formatMessage({id: sMacInfo}, {0: this.state.selectedRowKeys.join('  ')})}}
                            ></span>,
                onOk() {
                    __this._bindAddDelOk(sAction, isbind)
                },
                onCancel() {}
            })
        }
    }
    _bindAddDelOk = (sAction, isbind) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)

        let selectConditionIndex = []
        let selectedRows = this.state.selectedRows || []
        selectedRows.map(function(item) {
            selectConditionIndex.push(item.condition_index)
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": sAction,
                "isbind": isbind,
                "mac": this.state.selectedRowKeys.join(',')
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
                    const new_total_page = Math.floor((new_total - this.state.selectedRowKeys.length) / 10) + 1
                    if (current > new_total_page) {
                        current = new_total_page
                    }
                    pagination.current = current

                    this._getInitData({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'mac',
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
   _showbind = (text, record, index) => {
        let bind
        const { formatMessage } = this.props.intl

        if (text === 'yes') {
            bind = <span>{ formatMessage({ id: "LANG4681" }) }</span>
        } else {
            bind = <span>{ formatMessage({ id: "LANG4682" }) }</span>
        }
        return bind
    }
    _handleTableChange = (pagination, filters, sorter) => {
        const pager = this.state.pagination

        pager.current = pagination.current
        pager.pageSize = pagination.pageSize

        this.setState({
            pagination: pager,
            sorter: sorter
        })

        this._getInitData({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter.field ? sorter.field : 'mac',
            sord: sorter.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _createOption = (text, record, index) => {
        let bindItem
        let unbindItem
        const { formatMessage } = this.props.intl

        if (record.isbind === "yes") {
            bindItem = <span
                                    className="sprite sprite-edit"
                                    title={ formatMessage({id: "LANG4685"}) }
                                    onClick={ this._edit.bind(this, record) }>
                                </span>
            unbindItem = <Popconfirm
                                    title={ formatMessage({id: "LANG4686"}, {
                                        0: record.mac}) }
                                    okText={ formatMessage({id: "LANG727"}) }
                                    cancelText={ formatMessage({id: "LANG726"}) }
                                    onConfirm={ this._delete.bind(this, record) }
                                >
                                    <span className="sprite sprite-unbind" title={ formatMessage({id: "LANG4684"}) }></span>
                                </Popconfirm>
        } else {
            bindItem = <span
                                    className="sprite sprite-bind"
                                    title={ formatMessage({id: "LANG4683"}) }
                                    onClick={ this._edit.bind(this, record) }>
                                </span>
            unbindItem = <span className="sprite sprite-unbind-disabled" title={ formatMessage({id: "LANG4684"}) }></span>
        }

        return <div>
           { bindItem }
           { unbindItem }
        </div>
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'mac',
                dataIndex: 'mac',
                title: formatMessage({id: "LANG154"}),
                sorter: true
            }, {
                key: 'ip',
                dataIndex: 'ip',
                title: formatMessage({id: "LANG155"}),
                sorter: true
            }, {
                key: 'client',
                dataIndex: 'client',
                className: 'hidden',
                title: formatMessage({id: "LANG4584"}),
                sorter: true
            }, {
                key: 'status',
                dataIndex: 'status',
                className: 'hidden',
                title: formatMessage({id: "LANG4652"}),
                sorter: true
            }, {
                key: 'isbind',
                dataIndex: 'isbind',
                title: formatMessage({id: "LANG4585"}),
                sorter: true,
                render: (text, record, index) => (
                    this._showbind(text, record, index)
                )
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => (
                    this._createOption(text, record, index)
                )
            }]
        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG4587"})
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
                            { formatMessage({id: "LANG4587"}) }
                        </Button>
                        <Button
                            icon="add"
                            type="primary"
                            size='default'
                            onClick={ this._batchadd }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG4687"}) }
                        </Button>
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._batchdelete }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG5067"}) }
                        </Button>
                    </div>
                    <div className="content">
                        <p >
                            <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4796"})}} >
                            </span>
                        </p>
                    </div>
                    <Table
                        rowKey="mac"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.DHCPClientList }
                        showHeader={ !!this.state.DHCPClientList.length }
                        onChange={ this._handleTableChange }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(DHCPClient)

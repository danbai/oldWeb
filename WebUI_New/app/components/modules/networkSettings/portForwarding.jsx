'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag } from 'antd'

const addZero = UCMGUI.addZero

class PortForwarding extends Component {
    constructor(props) {
        super(props)
        this.state = {
            portForwardingList: [],
            selectedRowKeys: [],
            selectedRows: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {
                field: "id",
                order: "asc"
            }
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _add = () => {
        browserHistory.push('/system-settings/networkSettings/portForwarding/add')
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
                "action": "deletePortForwarding",
                "id": record.id
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
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'id',
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
        browserHistory.push('/system-settings/networkSettings/portForwarding/edit/' + record.id + '/' + record.wan_port)
    }
    _getInitData =(
        params = {
            item_num: 10,
            sidx: "id",
            sord: "asc",
            page: 1 
        }) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listPortForwarding',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const portForwardingList = response.id || []
                    const pagination = this.state.pagination

                    pagination.total = response.total_item

                    this.setState({
                        portForwardingList: portForwardingList,
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
            selectedRowKeys
        })
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: [],
            selectedRow: []
        })
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
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
            sidx: sorter.field ? sorter.field : 'id',
            sord: sorter.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
   _protocol = (text, record, index) => {
        let protocol
        const { formatMessage } = this.props.intl

        if (text === 0) {
            protocol = <span>{ formatMessage({ id: "LANG556" }) }</span>
        } else if (text === 1) {
            protocol = <span>{ formatMessage({ id: "LANG557" }) }</span>
        } else if (text === 2) {
            protocol = <span>{ formatMessage({ id: "LANG558" }) }</span>
        } else {
            protocol = <span>{ formatMessage({ id: "LANG2403" }) }</span>
        }
        return protocol
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'id',
                dataIndex: 'id',
                className: 'hidden',
                title: '',
                sorter: true
            }, {
                key: 'wan_port',
                dataIndex: 'wan_port',
                title: formatMessage({id: "LANG552"}),
                sorter: true
            }, {
                key: 'lan_ip',
                dataIndex: 'lan_ip',
                title: formatMessage({id: "LANG553"}),
                sorter: true
            }, {
                key: 'lan_port',
                dataIndex: 'lan_port',
                title: formatMessage({id: "LANG554"}),
                sorter: true
            }, {
                key: 'protocol',
                dataIndex: 'protocol',
                title: formatMessage({id: "LANG555"}),
                sorter: true,
                render: (text, record, index) => (
                    this._protocol(text, record, index)
                )
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
                            { formatMessage({id: "LANG4340"}, {
                                0: formatMessage({id: "LANG709"})
                            }) }
                        </Button>
                    </div>
                    <Table
                        rowKey="id"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.portForwardingList }
                        showHeader={ !!this.state.portForwardingList.length }
                        onChange={ this._handleTableChange }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(PortForwarding)

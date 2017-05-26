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

class StaticRoute extends Component {
    constructor(props) {
        super(props)
        this.state = {
            staticRouteList: [],
            staticRouteIpv6List: [],
            selectedRowKeys: [],
            selectedRows: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {
                field: "route_index",
                order: "asc"
            },
            selectedRowKeysIPv6: [],
            selectedRowsIPv6: [],
            paginationIPv6: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorterIPv6: {
                field: "ipv6_route_index",
                order: "asc"
            }
        }
    }
    componentDidMount() {
        this._getInitData()
        this._getInitDataIPv6()
    }
    _add = () => {
        browserHistory.push('/system-settings/networkSettings/staticRoute/add')
    }
    _addIpv6 = () => {
        browserHistory.push('/system-settings/networkSettings/staticRoute/addIpv6')
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
                "action": "deleteStaticRoute",
                "route_index": record.route_index,
                "route_dest": record.route_dest,
                "route_netmask": record.route_netmask,
                "route_gateway": record.route_gateway,
                "route_iface": record.route_iface,
                "route_active": record.route_active,
                "route_enabled": record.route_enabled
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
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'route_index',
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
    _deleteIpv6 = (record) => {
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
                "action": "deleteIpv6StaticRoute",
                "ipv6_route_index": record.ipv6_route_index,
                "ipv6_route_dest": record.ipv6_route_dest,
                "ipv6_route_gateway": record.ipv6_route_gateway,
                "ipv6_route_iface": record.ipv6_route_iface,
                "ipv6_route_active": record.ipv6_route_active,
                "ipv6_route_enabled": record.ipv6_route_enabled
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    const pagination = this.state.paginationIPv6
                    const pageSize = this.state.paginationIPv6.pageSize
                    let current = this.state.paginationIPv6.current
                    const old_total = this.state.paginationIPv6.total
                    const new_total = old_total - 1
                    const new_total_page = Math.floor((new_total - 1) / 10) + 1
                    if (current > new_total_page) {
                        current = new_total_page
                    }
                    pagination.current = current

                    this._getInitDataIPv6({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorterIPv6.field ? this.state.sorterIPv6.field : 'ipv6_route_index',
                        sord: this.state.sorterIPv6.order === "descend" ? "desc" : "asc"
                    })
                    this._clearSelectRows()
                    this.setState({
                        paginationIPv6: pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _edit = (record, index) => {
        browserHistory.push('/system-settings/networkSettings/staticRoute/edit/' + record.route_index + '/' + record.route_dest)
    }
    _editIpv6 = (record, index) => {
        browserHistory.push('/system-settings/networkSettings/staticRoute/editIpv6/' + record.ipv6_route_index + '/' + record.ipv6_route_dest)
    }
    _getInitData = (
        params = {
            item_num: 10,
            sidx: "route_index",
            sord: "asc",
            page: 1 
        }) => {
        const { formatMessage } = this.props.intl
        let staticRouteList = []

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listStaticRoutes',
                options: "route_index,route_dest,route_netmask,route_gateway,route_iface,route_active,route_enabled",
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    staticRouteList = response.static_routes || []
                    const pagination = this.state.pagination

                    pagination.total = response.total_item
                    this.setState({
                        staticRouteList: staticRouteList,
                        pagination: pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getInitDataIPv6 = (
        params = {
            item_num: 10,
            sidx: "ipv6_route_index",
            sord: "asc",
            page: 1 
        }) => {
        const { formatMessage } = this.props.intl
        let staticRouteIpv6List = []

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listIpv6StaticRoutes',
                options: "ipv6_route_index,ipv6_route_dest,ipv6_route_gateway,ipv6_route_iface,ipv6_route_active,ipv6_route_enabled",
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    staticRouteIpv6List = response.ipv6_static_routes || []
                    const pagination = this.state.paginationIPv6

                    pagination.total = response.total_item
                    this.setState({
                        staticRouteIpv6List: staticRouteIpv6List,
                        paginationIPv6: pagination
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
            selectedRowKeys: selectedRowKeys
        })
    }
    _onSelectChangeIPv6 = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ 
            selectedRowKeysIPv6: selectedRowKeys
        })
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: [],
            selectedRow: []
        })
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeysIPv6: [],
            selectedRowIPv6: []
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
            sidx: sorter.field ? sorter.field : 'route_index',
            sord: sorter.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _handleTableChangeIPv6 = (pagination, filters, sorter) => {
        const pager = this.state.paginationIPv6

        pager.current = pagination.current
        pager.pageSize = pagination.pageSize

        this.setState({
            paginationIPv6: pager,
            sorterIPv6: sorter
        })

        this._getInitDataIPv6({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter.field ? sorter.field : 'ipv6_route_index',
            sord: sorter.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _routeNetmask = (cellvalue, record, index) => {
        if (cellvalue === null || cellvalue === "") {
            return "(255.255.255.255)"
        } else {
            return cellvalue
        }
    }
    _routeGateway = (cellvalue, record, index) => {
        if (cellvalue === null || cellvalue === "") {
            return "(0.0.0.0)"
        } else {
            return cellvalue
        }
    }
    _routeGatewayIPv6 = (cellvalue, record, index) => {
        if (cellvalue === null || cellvalue === "") {
            return "(::)"
        } else {
            return cellvalue
        }
    }
   _routeIface = (cellvalue, record, index) => {
        let display_iface
        const { formatMessage } = this.props.intl
        let modeVal = this.props.dataMethod

        if (cellvalue === "1") {
            if (modeVal === 2) {
                display_iface = "LAN2"
            } else if (modeVal === 1) {
                display_iface = "LAN"
            } else {
                display_iface = "WAN"
            }
        } else if (cellvalue === "2") {
            display_iface = "DataTrunk1"
        } else {
            if (modeVal === 2) {
                display_iface = "LAN1"
            } else {
                display_iface = "LAN"
            }
        }

        return display_iface
    }
   _routeStatus = (test, record, index) => {
        let value
        const { formatMessage } = this.props.intl
        let modeVal = this.props.dataMethod

        if (test === 1) {
            value = <span>{ formatMessage({ id: "LANG136" }) }</span>
        } else {
            value = <span>{ formatMessage({ id: "LANG137" }) }</span>
        }

        return value
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'route_index',
                dataIndex: 'route_index',
                className: 'hidden',
                title: '',
                sorter: true
            }, {
                key: 'route_dest',
                dataIndex: 'route_dest',
                title: formatMessage({id: "LANG3049"}),
                sorter: true
            }, {
                key: 'route_netmask',
                dataIndex: 'route_netmask',
                title: formatMessage({id: "LANG3051"}),
                sorter: true,
                render: (text, record, index) => (
                    this._routeNetmask(text, record, index)
                )
            }, {
                key: 'route_gateway',
                dataIndex: 'route_gateway',
                title: formatMessage({id: "LANG3053"}),
                sorter: true,
                render: (text, record, index) => (
                    this._routeGateway(text, record, index)
                )
            }, {
                key: 'route_iface',
                dataIndex: 'route_iface',
                title: formatMessage({id: "LANG3055"}),
                sorter: true,
                render: (text, record, index) => (
                    this._routeIface(text, record, index)
                )
            }, {
                key: 'route_active',
                dataIndex: 'route_active',
                title: formatMessage({id: "LANG3061"}),
                sorter: true,
                render: (text, record, index) => (
                    this._routeStatus(text, record, index)
                )
            }, {
                key: 'route_enabled',
                dataIndex: 'route_enabled',
                title: formatMessage({id: "LANG2772"}),
                sorter: true,
                render: (text, record, index) => (
                    this._routeStatus(text, record, index)
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

        const columnsIpv6 = [{
                key: 'ipv6_route_index',
                dataIndex: 'ipv6_route_index',
                className: 'hidden',
                title: '',
                sorter: true
            }, {
                key: 'ipv6_route_dest',
                dataIndex: 'ipv6_route_dest',
                title: formatMessage({id: "LANG3049"}),
                sorter: true
            }, {
                key: 'ipv6_route_gateway',
                dataIndex: 'ipv6_route_gateway',
                title: formatMessage({id: "LANG3053"}),
                sorter: true,
                render: (text, record, index) => (
                    this._routeGatewayIPv6(text, record, index)
                )
            }, {
                key: 'ipv6_route_iface',
                dataIndex: 'ipv6_route_iface',
                title: formatMessage({id: "LANG3055"}),
                sorter: true,
                render: (text, record, index) => (
                    this._routeIface(text, record, index)
                )
            }, {
                key: 'ipv6_route_active',
                dataIndex: 'ipv6_route_active',
                title: formatMessage({id: "LANG3061"}),
                sorter: true,
                render: (text, record, index) => (
                    this._routeStatus(text, record, index)
                )
            }, {
                key: 'ipv6_route_enabled',
                dataIndex: 'ipv6_route_enabled',
                title: formatMessage({id: "LANG2772"}),
                sorter: true,
                render: (text, record, index) => (
                    this._routeStatus(text, record, index)
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
                                onClick={ this._editIpv6.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._deleteIpv6.bind(this, record) }
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

        const rowSelectionIPv6 = {
                onChange: this._onSelectChangeIPv6,
                selectedRowKeys: this.state.selectedRowKeysIPv6
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
                            { formatMessage({id: "LANG3048"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="route_index"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.staticRouteList }
                        showHeader={ !!this.state.staticRouteList.length }
                        onChange={ this._handleTableChange }
                    />
                </div>
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._addIpv6 }
                        >
                            { formatMessage({id: "LANG5234"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="ipv6_route_index"
                        columns={ columnsIpv6 }
                        pagination={ this.state.paginationIPv6 }
                        rowSelection={ rowSelectionIPv6 }
                        dataSource={ this.state.staticRouteIpv6List }
                        showHeader={ !!this.state.staticRouteIpv6List.length }
                        onChange={ this._handleTableChangeIPv6 }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(StaticRoute)

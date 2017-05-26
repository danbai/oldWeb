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

window.pmsRoomStatusAutoRefresh = null

class pmsRooms extends Component {
    constructor(props) {
        super(props)
        this.state = {
            accountList: [],
            accountAryObj: {},
            selectedRowKeys: [],
            pmsRooms: [],
            batchDeleteModalVisible: false,
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
        this._getAccountList()
        this._getPmsRooms()
        window.pmsRoomStatusAutoRefresh = setInterval(this._refreshPmsRooms, 3000)
    }
    componentWillUnmount() {
        clearInterval(window.pmsRoomStatusAutoRefresh)
    }
    _refreshPmsRooms = () => {
        this._getPmsRooms({
            item_num: this.state.pagination.pageSize ? this.state.pagination.pageSize : 10,
            page: this.state.pagination.current ? this.state.pagination.current : 1,
            sidx: this.state.sorter.field ? this.state.sorter.field : 'address',
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
                    browserHistory.push('/value-added-features/pms/2')
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            browserHistory.push('/value-added-features/pms/pmsRooms/add')
        }
    }
    _batchadd = () => {
        let confirmContent = ''
        const { formatMessage } = this.props.intl

        confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG880" })}}></span>

        if (!this.state.accountList.length) {
            confirm({
                content: confirmContent,
                onOk() {
                    browserHistory.push('/value-added-features/pms/2')
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            browserHistory.push('/value-added-features/pms/pmsRooms/batchadd')
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
                "action": "deletePMSRoom",
                "address": record.address
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

                    this._getPmsRooms({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'address',
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
    _batchdelete = () => {
        this.setState({
            batchDeleteModalVisible: true
        })
    }
    _batchdeleteCancel = () => {
        this.setState({
            batchDeleteModalVisible: false
        })
    }
    _batchdeleteOk = (record) => {
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
                "action": "deletePMSRoom",
                "address": this.state.selectedRowKeys.join(',')
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

                    this._getPmsRooms({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'address',
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
        browserHistory.push('/value-added-features/pms/pmsRooms/edit/' + record.address + '/' + record.address)
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
    _getPmsRooms = (
        params = {                
                item_num: 10,
                sidx: "address",
                sord: "asc",
                page: 1 
            }
        ) => {
        const { formatMessage } = this.props.intl
        // this.setState({loading: true})

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listPMSRoom',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const pmsRooms = response.pms_room || []
                    const pagination = this.state.pagination
                    // Read total count from server
                    pagination.total = res.response.total_item

                    this.setState({
                        loading: false,
                        pmsRooms: pmsRooms,
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

        this._getPmsRooms({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'address',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ 
            selectedRowKeys: selectedRowKeys
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'address',
                dataIndex: 'address',
                title: formatMessage({id: "LANG4893"}),
                sorter: true
            }, {
                key: 'room',
                dataIndex: 'room',
                title: formatMessage({id: "LANG4854"}),
                sorter: true
            }, {
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG85"}),
                sorter: true
            }, {
                key: 'status',
                dataIndex: 'status',
                title: formatMessage({id: "LANG4857"}),
                render: (text, record, index) => {
                    if (text === '0') {
                        return <span>{ formatMessage({id: "LANG4941"}) }</span>
                    } else if (text === '1') {
                        return <span>{ formatMessage({id: "LANG4942"}) }</span>
                    } else if (text === '2') {
                        return <span>{ formatMessage({id: "LANG4943"}) }</span>
                    } else if (text === '3') {
                        return <span>{ formatMessage({id: "LANG4944"}) }</span>
                    } else {
                        return <span>{ formatMessage({id: "LANG4942"}) }</span>
                    }
                },
                sorter: true
            }, {
                key: 'user_name',
                dataIndex: 'user_name',
                title: formatMessage({id: "LANG2809"}),
                sorter: false,
                render: (text, record, index) => {
                    if (record.last_name && record.first_name) {
                        return <span>{ record.first_name + ' ' + record.last_name }</span>
                    } else if (record.last_name) {
                        return <span>{ record.last_name }</span>
                    } else if (record.first_name) {
                        return <span>{ record.first_name }</span>
                    } else {
                        return ''
                    }
                }
            }, {
                key: 'account',
                dataIndex: 'account',
                title: formatMessage({id: "LANG4872"}),
                sorter: false
            }, {
                key: 'vipcode',
                dataIndex: 'vipcode',
                title: formatMessage({id: "LANG4873"}),
                sorter: false
            }, {
                key: 'credit',
                dataIndex: 'credit',
                title: formatMessage({id: "LANG4876"}),
                sorter: false
            }, {
                key: 'maid',
                dataIndex: 'maid',
                title: formatMessage({id: "LANG4963"}),
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
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                        </div>
                }
            }]
        const pagination = {
                total: this.state.pmsRooms.length,
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
                    1: formatMessage({id: "LANG4855"})
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
                            { formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG4856"}) }) }
                        </Button>
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._batchdelete }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG3872"}, {0: formatMessage({id: "LANG4969"}) }) }
                        </Button>
                        <Modal
                            onOk={ this._batchdeleteOk }
                            onCancel={ this._batchdeleteCancel }
                            title={ formatMessage({id: "LANG543"}) }
                            okText={ formatMessage({id: "LANG727"}) }
                            cancelText={ formatMessage({id: "LANG726"}) }
                            visible={ this.state.batchDeleteModalVisible }
                        >
                            <span dangerouslySetInnerHTML=
                                {{__html: formatMessage({id: "LANG2710"}, {0: formatMessage({id: "LANG4969"}), 1: this.state.selectedRowKeys.join('  ')})}}
                            ></span>
                        </Modal>
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._batchadd }
                        >
                            { formatMessage({id: "LANG4965"}, {0: formatMessage({id: "LANG4969"}) }) }
                        </Button>
                    </div>
                    <Table
                        rowKey="address"
                        columns={ columns }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.pmsRooms }
                        showHeader={ !!this.state.pmsRooms.length }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(pmsRooms)

'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag, BackTop } from 'antd'

const confirm = Modal.confirm

class ExtensionGroup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            accountList: [],
            accountAryObj: {},
            selectedRowKeys: [],
            extensionGroups: [],
            miniBar: [],
            miniBarWaiter: [],
            miniBarGoods: [],
            buttonMinibar: true,
            pagination_waiter: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            pagination_goods: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter_waiter: {},
            sorter_goods: {},
            loading: false
        }
    }
    componentDidMount() {
        this._getMiniBar()
        this._getMiniBarWaiter()
        this._getMiniBarGoods()
        this._getAccountList()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _addbar = () => {
        let confirmContent = ''
        const { formatMessage } = this.props.intl

        confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG880" })}}></span>

        if (!this.state.accountList.length) {
            confirm({
                content: confirmContent,
                onOk() {
                    browserHistory.push('/value-added-features/pms/pmsMinibar')
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            browserHistory.push('/value-added-features/pms/pmsMinibar/addbar')
        }
    }
    _addwaiter = () => {
        let confirmContent = ''
        const { formatMessage } = this.props.intl

        confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG880" })}}></span>

        if (!this.state.accountList.length) {
            confirm({
                content: confirmContent,
                onOk() {
                    browserHistory.push('/value-added-features/pms/pmsMinibar')
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            browserHistory.push('/value-added-features/pms/pmsMinibar/addwaiter')
        }
    }
    _addgoods = () => {
        let confirmContent = ''
        const { formatMessage } = this.props.intl

        confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG880" })}}></span>

        if (!this.state.accountList.length) {
            confirm({
                content: confirmContent,
                onOk() {
                    browserHistory.push('/value-added-features/pms/4')
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            browserHistory.push('/value-added-features/pms/pmsMinibar/addgoods')
        }
    }
    _deletebar = (record) => {
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
                "action": "deleteMiniBar",
                "extension": record.extension
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._getMiniBar()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _deletewaiter = (record) => {
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
                "action": "deleteMiniBarWaiter",
                "waiter_id": record.waiter_id
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    const pagination = this.state.pagination_waiter
                    const pageSize = this.state.pagination_waiter.pageSize
                    let current = this.state.pagination_waiter.current
                    const old_total = this.state.pagination_waiter.total
                    const new_total = old_total - 1
                    const new_total_page = (new_total - 1) / pageSize + 1
                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }
                    pagination.current = current

                    this._getMiniBarWaiter({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter_waiter.field ? this.state.sorter_waiter.field : 'waiter_id',
                        sord: this.state.sorter_waiter.order === "descend" ? "desc" : "asc"
                    })
                    this.setState({
                        pagination_waiter: pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _deletegoods = (record) => {
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
                "action": "deleteMiniBarGoods",
                "extension": record.extension
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    const pagination = this.state.pagination_goods
                    const pageSize = this.state.pagination_goods.pageSize
                    let current = this.state.pagination_goods.current
                    const old_total = this.state.pagination_goods.total
                    const new_total = old_total - 1
                    const new_total_page = (new_total - 1) / pageSize + 1
                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }
                    pagination.current = current

                    this._getMiniBarGoods({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter_goods.field ? this.state.sorter_goods.field : 'goods_name',
                        sord: this.state.sorter_goods.order === "descend" ? "desc" : "asc"
                    })
                    this.setState({
                        pagination_goods: pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _editbar = (record) => {
        browserHistory.push('/value-added-features/pms/pmsMinibar/editbar/' + record.extension + '/' + record.minibar_name)
    }
    _editwaiter = (record) => {
        browserHistory.push('/value-added-features/pms/pmsMinibar/editwaiter/' + record.waiter_id + '/' + record.waiter_id)
    }
    _editgoods = (record) => {
        browserHistory.push('/value-added-features/pms/pmsMinibar/editgoods/' + record.extension + '/' + record.goods_name)
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
    _getMiniBar = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listMiniBar',
                sidx: 'minibar_name',
                sord: 'asc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const miniBar = response.minibar_settings || []

                    this.setState({
                        miniBar: miniBar,
                        buttonMinibar: (miniBar.length > 0 ? false : true)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _getMiniBarWaiter = (
        params = {                
                item_num: 10,
                sidx: "waiter_id",
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
                action: 'listMiniBarWaiter',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const miniBarWaiter = response.minibar_waiter || []
                    const pagination_waiter = this.state.pagination_waiter
                    // Read total count from server
                    pagination_waiter.total = res.response.total_item

                    this.setState({
                        loading: false,
                        miniBarWaiter: miniBarWaiter,
                        pagination_waiter
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _getMiniBarGoods = (
        params = {                
                item_num: 10,
                sidx: "goods_name",
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
                action: 'listMiniBarGoods',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const miniBarGoods = response.minibar_goods || []
                    const pagination_goods = this.state.pagination_goods
                    // Read total count from server
                    pagination_goods.total = res.response.total_item

                    this.setState({
                        loading: false,
                        miniBarGoods: miniBarGoods,
                        pagination_goods
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleTableChangeWaiter = (pagination_waiter, filters, sorter) => {
        const pager_waiter = this.state.pagination_waiter

        pager_waiter.current = pagination_waiter.current
        pager_waiter.pageSize = pagination_waiter.pageSize

        let sorter_here = {}

        if (sorter && sorter.field) {
            this.setState({
                pagination_waiter: pager_waiter,
                sorter_waiter: sorter
            })
            sorter_here = sorter
        } else {
            this.setState({
                pagination_waiter: pager_waiter
            })
            sorter_here = this.state.sorter_waiter
        }

        this._getMiniBarWaiter({
            item_num: pagination_waiter.pageSize,
            page: pagination_waiter.current,
            sidx: sorter_here.field ? sorter_here.field : 'waiter_id',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _handleTableChangeGoods = (pagination_goods, filters, sorter) => {
        const pager_goods = this.state.pagination_goods

        pager_goods.current = pagination_goods.current
        pager_goods.pageSize = pagination_goods.pageSize

        let sorter_here = {}

        if (sorter && sorter.field) {
            this.setState({
                pagination_goods: pager_goods,
                sorter_goods: sorter
            })
            sorter_here = sorter
        } else {
            this.setState({
                pagination_goods: pager_goods
            })
            sorter_here = this.state.sorter_goods
        }

        this._getMiniBarGoods({
            item_num: pagination_goods.pageSize,
            page: pagination_goods.current,
            sidx: sorter_here.field ? sorter_here.field : 'goods_name',
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
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG4341"}),
                width: 100,
                sorter: true
            }, {
                key: 'minibar_name',
                dataIndex: 'minibar_name',
                title: formatMessage({id: "LANG135"}),
                width: 100,
                sorter: true
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                width: 100,
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG738"}) }
                                onClick={ this._editbar.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._deletebar.bind(this, record) }
                            >
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                        </div>
                }
            }]
        const columns_waiter = [{
                key: 'waiter_id',
                dataIndex: 'waiter_id',
                title: formatMessage({id: "LANG4963"}),
                width: 100,
                sorter: true
            }, {
                key: 'secret',
                dataIndex: 'secret',
                title: formatMessage({id: "LANG127"}),
                width: 100,
                sorter: false
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                width: 100,
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG738"}) }
                                onClick={ this._editwaiter.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._deletewaiter.bind(this, record) }
                            >
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                        </div>
                }
            }]
        const columns_goods = [{
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG4341"}),
                width: 100,
                sorter: true
            }, {
                key: 'goods_name',
                dataIndex: 'goods_name',
                title: formatMessage({id: "LANG135"}),
                width: 100,
                sorter: true
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                width: 100,
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG738"}) }
                                onClick={ this._editgoods.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._deletegoods.bind(this, record) }
                            >
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                        </div>
                }
            }]
        const pagination = {
                total: this.state.miniBar.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }
        const pagination_waiter = {
                total: this.state.miniBarWaiter.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }
        const pagination_goods = {
                total: this.state.miniBarGoods.length,
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
                            disabled={ this.state.buttonMinibar ? false : true }
                            onClick={ this._addbar }
                        >
                            { formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG5056"}) }) }
                        </Button>
                    </div>
                    <Table
                        rowKey="extension"
                        columns={ columns }
                        pagination={ false }
                        dataSource={ this.state.miniBar }
                        showHeader={ !!this.state.miniBar.length }
                    />
                </div>
                <div className="content" style={{marginTop: '30px'}}>
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._addwaiter }
                        >
                            { formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG5057"}) }) }
                        </Button>
                    </div>
                    <Table
                        rowKey="waiter_id"
                        columns={ columns_waiter }
                        pagination={ this.state.pagination_waiter }
                        dataSource={ this.state.miniBarWaiter }
                        showHeader={ !!this.state.miniBarWaiter.length }
                        onChange={ this._handleTableChangeWaiter }
                        loading={ this.state.loading}
                    />
                </div>
                <div className="content" style={{marginTop: '30px'}}>
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._addgoods }
                        >
                            { formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG5050"}) }) }
                        </Button>
                    </div>
                    <Table
                        rowKey="extension"
                        columns={ columns_goods }
                        pagination={ this.state.pagination_goods }
                        dataSource={ this.state.miniBarGoods }
                        showHeader={ !!this.state.miniBarGoods.length }
                        onChange={ this._handleTableChangeGoods }
                        loading={ this.state.loading}
                    />
                </div>
                <div>
                    <BackTop />
                </div>
            </div>
        )
    }
}

export default injectIntl(ExtensionGroup)

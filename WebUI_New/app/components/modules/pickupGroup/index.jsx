'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Badge, Button, message, Modal, Popconfirm, Popover, Table, Tag } from 'antd'

const confirm = Modal.confirm

class PickupGroup extends Component {
    constructor(props) {
        super(props)

        this.state = {
            accountList: [],
            extgroupObj: {},
            extgroupList: [],
            pickupgroups: [],
            accountAryObj: {},
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
        this._getAccountList()
        this._getExtensionGroupList()
        this._getPickupgroups()
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
            browserHistory.push('/call-features/pickupGroup/add')
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
                "action": "deletePickupgroup",
                "pickupgroup": record.pickupgroup_id
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

                    this._getPickupgroups({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'pickupgroup_name',
                        sord: this.state.sorter.order === "ascend" ? "asc" : "desc"
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
        browserHistory.push('/call-features/pickupGroup/edit/' + record.pickupgroup_id + '/' + record.pickupgroup_name)
    }
    _createMembers = (text, record, index) => {
        let members = text ? text.split(',') : []

        const { formatMessage } = this.props.intl
        const extgroupLabel = formatMessage({id: "LANG2714"})

        members = members.map(function(value, index) {
                const item = this.state.extgroupObj[value]

                if (item) {
                    return extgroupLabel + "--" + item.group_name
                } else {
                    return value
                }
            }.bind(this))

        if (members.length <= 5) {
            return <div>
                    {
                        members.map(function(value, index) {
                            return <Tag key={ value }>{ value }</Tag>
                        }.bind(this))
                    }
                </div>
        } else {
            const content = <div>
                        {
                            members.map(function(value, index) {
                                if (index >= 4) {
                                    return <Tag key={ value }>{ value }</Tag>
                                }
                            }.bind(this))
                        }
                    </div>

            return <div>
                    {
                        [0, 1, 2, 3].map(function(value, index) {
                            return <Tag key={ members[value] }>{ members[value] }</Tag>
                        }.bind(this))
                    }
                    <Popover
                        title=""
                        content={ content }
                    >
                        <Badge
                            overflowCount={ 10 }
                            count={ members.length - 4 }
                        />
                    </Popover>
                </div>
        }
    }
    _createOptions = (text, record, index) => {
        const { formatMessage } = this.props.intl

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
    _getAccountList = () => {
        $.ajax({
            type: 'post',
            // async: false,
            url: api.apiHost,
            data: { action: 'getAccountList' },
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
    _getExtensionGroupList = () => {
        let extgroupObj = {}
        let extgroupList = []

        $.ajax({
            type: 'post',
            // async: false,
            url: api.apiHost,
            data: {
                action: 'getExtensionGroupList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}

                    extgroupList = response.extension_groups || []

                    extgroupList.map(function(item) {
                        extgroupObj[item.group_id] = item
                    })

                    this.setState({
                        extgroupObj: extgroupObj,
                        extgroupList: extgroupList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getPickupgroups = (
        params = {                
                item_num: 10,
                sidx: "pickupgroup_name",
                sord: "asc",
                page: 1 
            }
        ) => {
        const { formatMessage } = this.props.intl

        this.setState({loading: true})

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listPickupgroup',
                ...params
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const pickupgroups = response.pickupgroup || []
                    const pagination = this.state.pagination

                    pagination.total = res.response.total_item

                    this.setState({
                        loading: false,
                        pickupgroups: pickupgroups,
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

        this._getPickupgroups({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'pickupgroup_name',
            sord: sorter_here.order === "ascend" ? "asc" : "desc",
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
                key: 'pickupgroup_name',
                dataIndex: 'pickupgroup_name',
                title: formatMessage({id: "LANG135"}),
                sorter: true
            }, {
                key: 'members',
                dataIndex: 'members',
                title: formatMessage({id: "LANG128"}),
                render: (text, record, index) => (
                    this._createMembers(text, record, index)
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
                total: this.state.pickupgroups.length,
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
                    1: formatMessage({id: "LANG2510"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG2510"}) }
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
                        rowKey="pickupgroup_id"
                        columns={ columns }
                        dataSource={ this.state.pickupgroups }
                        showHeader={ !!this.state.pickupgroups.length }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(PickupGroup)

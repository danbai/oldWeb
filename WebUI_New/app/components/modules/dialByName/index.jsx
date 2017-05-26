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

class DialByName extends Component {
    constructor(props) {
        super(props)

        this.state = {
            sorter: {},
            loading: false,
            extgroupObj: {},
            extgroupList: [],
            dialByNameList: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            }
        }
    }
    componentDidMount() {
        this._getExtensionGroupList()
        this._getDialByNameList()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        browserHistory.push('/call-features/dialByName/add')
    }
    _delete = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            type: 'post',
            async: true,
            url: api.apiHost,
            data: {
                "action": "deleteDirectory",
                "directory": record.extension
            },
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

                    this._getDialByNameList({
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
        browserHistory.push('/call-features/dialByName/edit/' + record.extension + '/' + record.name)
    }
    _getDialByNameList = (
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
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listDirectory',
                ...params
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const dialByNameList = response.directory || []
                    const pagination = this.state.pagination

                    pagination.total = res.response.total_item

                    this.setState({
                        loading: false,
                        dialByNameList: dialByNameList,
                        pagination
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

        this._getDialByNameList({
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
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const columns = [{
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG85"}),
                sorter: true
            }, {
                key: 'name',
                dataIndex: 'name',
                title: formatMessage({id: "LANG135"}),
                sorter: true
            }, {
                key: 'members',
                dataIndex: 'members',
                title: formatMessage({id: "LANG128"}),
                render: (text, record, index) => {
                    let members_tmp = text ? text.split(',') : []

                    let members = []

                    members_tmp.map(function(item) {
                        if (item.slice(0, 3) !== 'dc=') {
                            members.push(item)
                        }
                    })

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
                                        const item = members[value]

                                        return <Tag key={ item }>{ item }</Tag>
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
                total: this.state.dialByNameList.length,
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
                    1: formatMessage({id: "LANG2884"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG2884"}) }
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
                        rowKey="extension"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        dataSource={ this.state.dialByNameList}
                        showHeader={ !!this.state.dialByNameList.length }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(DialByName)
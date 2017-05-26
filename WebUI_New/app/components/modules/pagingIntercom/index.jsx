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

class PagingIntercom extends Component {
    constructor(props) {
        super(props)

        this.state = {
            sorter: {},
            loading: false,
            accountList: [],
            extgroupObj: {},
            paginggroups: [],
            extgroupList: [],
            accountAryObj: {},
            selectedRowKeys: [],
            existedExtensionLength: 0,
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            }
        }
    }
    componentDidMount() {
        this._getAccountList()
        this._getExtensionGroupList()
        this._getPaginggroup()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        const { formatMessage } = this.props.intl

        let featureLimits = JSON.parse(localStorage.getItem('featureLimits'))
        let max = (featureLimits && featureLimits.paging_interciom ? parseInt(featureLimits.paging_interciom) : 50)
        let confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG880" })}}></span>

        if (this.state.existedExtensionLength >= max) {
            const warningMessage = <span dangerouslySetInnerHTML=
                                        {{ __html: formatMessage({ id: "LANG809" }, {
                                                0: formatMessage({ id: "LANG604" }),
                                                1: max
                                            })
                                        }}
                                    ></span>

            message.destroy()
            message.warning(warningMessage)
        } else if (!this.state.accountList.length) {
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
            browserHistory.push('/call-features/pagingIntercom/add')
        }
    }
    _delete = (record) => {
        const { formatMessage } = this.props.intl

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            type: 'post',
            async: true,
            url: api.apiHost,
            data: {
                "action": "deleteRinggroup",
                "ringgroup": record.extension
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    let pagination = this.state.pagination
                    let pageSize = pagination.pageSize
                    let current = pagination.current
                    let old_total = pagination.total

                    let new_total = old_total - 1
                    let new_total_page = (new_total - 1) / pageSize + 1

                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }

                    pagination.current = current

                    this._getPaginggroup({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'extension',
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
    _deleteBatchOK = (record) => {
        const { formatMessage } = this.props.intl

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            type: 'post',
            async: true,
            url: api.apiHost,
            data: {
                "action": "deletePaginggroup",
                "paginggroup": this.state.selectedRowKeys.join(',')
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    let pagination = this.state.pagination
                    let pageSize = pagination.pageSize
                    let current = pagination.current
                    let old_total = pagination.total

                    let new_total = old_total - this.state.selectedRowKeys.length
                    let new_total_page = (new_total - this.state.selectedRowKeys.length) / pageSize + 1

                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }

                    pagination.current = current

                    this._getPaginggroup({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'extension',
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
    _deleteBatch = (record) => {
        const __this = this
        const { formatMessage } = this.props.intl

        if (this.state.selectedRowKeys.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG604"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG818"}, {0: this.state.selectedRowKeys.join('  ')})}} ></span>,
                onOk() {
                    __this._deleteBatchOK(record)
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _edit = (record) => {
        browserHistory.push('/call-features/pagingIntercom/edit/' + record.extension + '/' + record.paginggroup_name)
    }
    _createMembers = (text, record, index) => {
        let members = text ? text.split(',') : []
        let { formatMessage } = this.props.intl
        let extgroupLabel = formatMessage({id: "LANG2714"})

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
    _createPaginggroupType = (text, record, index) => {
        let strategy
        let { formatMessage } = this.props.intl

        if (text && text === '2way') {
            strategy = formatMessage({ id: "LANG1162" })
        } else {
            strategy = formatMessage({ id: "LANG1161" })
        }

        return strategy
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
                sord: 'asc',
                sidx: 'group_id',
                action: 'listExtensionGroup'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}

                    extgroupList = response.extension_group || []

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
    _getPaginggroup = (
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
                action: 'listPaginggroup',
                ...params
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const paginggroups = response.paginggroup || []

                    let pagination = this.state.pagination
                    let existedExtensionLength = res.response.total_item

                    pagination.total = res.response.total_item

                    this.setState({
                        pagination,
                        loading: false,
                        paginggroups: paginggroups,
                        existedExtensionLength: existedExtensionLength
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

        this._getPaginggroup({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'extension',
            sord: sorter_here.order === "ascend" ? "asc" : "desc",
            ...filters
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ selectedRowKeys })
    }
    _settings = (record) => {
        browserHistory.push('/call-features/pagingIntercom/setting')
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
                key: 'paginggroup_name',
                dataIndex: 'paginggroup_name',
                title: formatMessage({id: "LANG135"}),
                sorter: true
            }, {
                key: 'paginggroup_type',
                dataIndex: 'paginggroup_type',
                title: formatMessage({id: "LANG1137"}),
                sorter: false,
                render: (text, record, index) => (
                    this._createPaginggroupType(text, record, index)
                )
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
                total: this.state.paginggroups.length,
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
                    1: formatMessage({id: "LANG604"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG604"}) }
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
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._deleteBatch }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG739"}) }
                        </Button>
                        <Button
                            icon="setting"
                            type="primary"
                            size='default'
                            onClick={ this._settings }
                        >
                            { formatMessage({id: "LANG746"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="extension"
                        columns={ columns }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.paginggroups }
                        showHeader={ !!this.state.paginggroups.length }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(PagingIntercom)

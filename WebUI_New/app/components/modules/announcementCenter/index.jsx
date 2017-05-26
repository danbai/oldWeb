'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Badge, Button, message, Modal, Popconfirm, Table, Tag, BackTop, Popover } from 'antd'

const confirm = Modal.confirm

class Announcement extends Component {
    constructor(props) {
        super(props)
        this.state = {
            accountList: [],
            accountAryObj: {},
            selectedRowKeys: [],
            extensionGroups: [],
            announcementCenter: [],
            announcementGroup: [],
            buttonMinibar: true,
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            pagination_group: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {},
            sorter_groups: {},
            loading: false
        }
    }
    componentDidMount() {
        this._getAnnouncementCenter()
        this._getAnnouncementGroup()
        this._getAccountList()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        let confirmContent = ''
        const { formatMessage } = this.props.intl

        browserHistory.push('/value-added-features/announcementCenter/add')
    }
    _addgroup = () => {
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
            browserHistory.push('/value-added-features/announcementCenter/addgroup')
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
                "action": "deleteCodeblueCode",
                "codeblue_code": record.extension
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

                    this._getAnnouncementCenter({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'extension',
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
    _deletegroup = (record) => {
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
                "action": "deleteCodeblueGroup",
                "codeblue_group": record.extension
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    const pagination = this.state.pagination_group
                    const pageSize = this.state.pagination_group.pageSize
                    let current = this.state.pagination_group.current
                    const old_total = this.state.pagination_group.total
                    const new_total = old_total - 1
                    const new_total_page = (new_total - 1) / pageSize + 1
                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }
                    pagination.current = current

                    this._getAnnouncementGroup({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter_groups.field ? this.state.sorter_groups.field : 'extension',
                        sord: this.state.sorter_groups.order === "descend" ? "desc" : "asc"
                    })
                    this._clearSelectRows()
                    this.setState({
                        pagination_group: pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _edit = (record) => {
        browserHistory.push('/value-added-features/announcementCenter/edit/' + record.extension + '/' + record.code_name)
    }
    _editgroup = (record) => {
        browserHistory.push('/value-added-features/announcementCenter/editgroup/' + record.extension + '/' + record.group_name)
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
    _getAnnouncementCenter = (
        params = {
            item_num: 10,
            page: 1,
            sord: 'asc',
            sidx: 'extension'
        }
        ) => {
        const { formatMessage } = this.props.intl
        this.setState({loading: true})

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listCodeblueCode',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const announcementCenter = response.codeblue_code || []
                    const pagination = this.state.pagination
                    pagination.total = response.total_item
                    pagination.current = params.page

                    this.setState({
                        loading: false,
                        announcementCenter: announcementCenter,
                        pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getAnnouncementGroup = (
        params = {
            item_num: 10,
            page: 1,
            sord: 'asc',
            sidx: 'extension'
        }
        ) => {
        const { formatMessage } = this.props.intl
        this.setState({loading: true})

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listCodeblueGroup',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const announcementGroup = response.codeblue_group || []
                    const pagination_group = this.state.pagination_group
                    pagination_group.total = response.total_item
                    pagination_group.current = params.page

                    this.setState({
                        loading: false,
                        announcementGroup: announcementGroup,
                        pagination_group
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
        
        this._getAnnouncementCenter({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : "extension",
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _handleTableChangeGroup = (pagination_group, filters, sorter) => {
        const pager_group = this.state.pagination_group

        pager_group.current = pagination_group.current

        let sorter_here = {}

        if (sorter && sorter.field) {
            this.setState({
                pagination_group: pager_group,
                sorter_groups: sorter
            })
            sorter_here = sorter
        } else {
            this.setState({
                pagination_group: pager_group
            })
            sorter_here = this.state.sorter_groups
        }
        
        this._getAnnouncementGroup({
            item_num: pagination_group.pageSize,
            page: pagination_group.current,
            sidx: sorter_here.field ? sorter_here.field : "extension",
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ selectedRowKeys })
    }
    _createMembers = (text, record, index) => {
        let members = text ? text.split(',') : []
        const { formatMessage } = this.props.intl
        const extgroupLabel = formatMessage({id: "LANG2714"})

        members = members.map(function(value, index) {
                return value
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
                key: 'code_name',
                dataIndex: 'code_name',
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
        const columns_group = [{
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG4342"}),
                width: 100,
                sorter: true
            }, {
                key: 'group_name',
                dataIndex: 'group_name',
                title: formatMessage({id: "LANG135"}),
                width: 100,
                sorter: true
            }, {
                key: 'members',
                dataIndex: 'members',
                title: formatMessage({id: "LANG128"}),
                width: 100,
                sorter: false,
                render: (text, record, index) => (
                    this._createMembers(text, record, index)
                )
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
                                onClick={ this._editgroup.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._deletegroup.bind(this, record) }
                            >
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                        </div>
                }
            }]
        const pagination = {
                total: this.state.announcementCenter.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }
        const pagination_group = {
                total: this.state.announcementGroup.length,
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
                    1: formatMessage({id: "LANG4338"})
                })

        return (
            <div className="app-content-main">
                <Title
                    isDisplay='hidden'
                    headerTitle={ formatMessage({id: "LANG4338"}) }
                />
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._add }
                        >
                            { formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG4338"}) }) }
                        </Button>
                    </div>
                    <Table
                        rowKey="extension"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        dataSource={ this.state.announcementCenter }
                        showHeader={ !!this.state.announcementCenter.length }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading }
                    />
                </div>
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._addgroup }
                        >
                            { formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG4339"}) }) }
                        </Button>
                    </div>
                    <Table
                        rowKey="extension"
                        columns={ columns_group }
                        pagination={ this.state.pagination_group }
                        dataSource={ this.state.announcementGroup }
                        showHeader={ !!this.state.announcementGroup.length }
                        onChange={ this._handleTableChangeGroup }
                        loading={ this.state.loading }
                    />
                </div>
                <div>
                    <BackTop />
                </div>
            </div>
        )
    }
}

export default injectIntl(Announcement)

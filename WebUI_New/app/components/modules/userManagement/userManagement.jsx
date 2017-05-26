'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag } from 'antd'

class UserList extends Component {
    constructor(props) {
        super(props)

        this.state = {
            userList: [],
            selectedRowKeys: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {},
            loading: false,
            privilegeObj: {}
        }
    }
    componentDidMount() {
        this._getPrivilege()
        this._getUserList()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        let confirmContent = ''
        const { formatMessage } = this.props.intl

        confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG880" })}}></span>

        browserHistory.push('/maintenance/userManagement/user/add')
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
                "action": "deleteUser",
                "user_name": record.user_name
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

                    this._getUserList({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'privilege',
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
        browserHistory.push('/maintenance/userManagement/user/edit/' + record.user_id + "/" + record.user_name)
    }
    _getPrivilege = () => {
        let privilegeObj = this.state.privilegeObj

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getPrivilege'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    const privilege = response.privilege || {}

                    privilege.map(function(item) {
                        if (item.level === 2 && item.privilege_id !== 1) {
                            privilegeObj[item.privilege_id] = item.privilege_name
                        }
                    })

                    this.setState({
                        privilegeObj: privilegeObj
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getUserList = (
            params = {                
                item_num: 10,
                sidx: "privilege",
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
                action: 'listUser',
                ...params
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const userList = response.user_id || []
                    const pagination = this.state.pagination

                    // Read total count from server
                    pagination.total = res.response.total_item
                    pagination.current = params.page

                    this.setState({
                        loading: false,
                        userList: userList,
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

        this._getUserList({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'privilege',
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
        if (this.props.firstLoad) {
            this._getUserList()
            this.props.setFirstLoad('user', false)
        }

        const { formatMessage } = this.props.intl

        let role = localStorage.getItem('role')
        let model_info = JSON.parse(localStorage.getItem('model_info'))

        const columns = [{
                key: 'user_name',
                dataIndex: 'user_name',
                title: formatMessage({id: "LANG2809"}),
                sorter: true
            }, {
                key: 'privilege',
                dataIndex: 'privilege',
                title: formatMessage({id: "LANG2811"}),
                render: (text, record, index) => {
                    if (text === 0) {
                        return <span>{ formatMessage({id: "LANG3860"}) }</span>
                    } else if (text === 1) {
                        return <span>{ formatMessage({id: "LANG1047"}) }</span>
                    } else if (text === 2) {
                        return <span>{ formatMessage({id: "LANG5173"}) }</span>
                    } else if (text === 3) {
                        return <span>{ formatMessage({id: "LANG2863"}) }</span>
                    } else {
                        return <span>{ formatMessage({id: "LANG5167"}) + ':' + this.state.privilegeObj[text] }</span>
                    }
                },
                sorter: true
            }, {
                key: 'login_time',
                dataIndex: 'login_time',
                title: formatMessage({id: "LANG2819"}),
                sorter: false
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    if (record.privilege === 0) {
                        return <div>
                                <span
                                    className="sprite sprite-edit"
                                    title={ formatMessage({id: "LANG738"}) }
                                    onClick={ this._edit.bind(this, record) }>
                                </span>
                                <span
                                    className="sprite sprite-del-disabled"
                                    title={ formatMessage({id: "LANG739"}) }>
                                </span>
                            </div>
                    } else if (record.privilege === 3) {
                        return <div>
                                <span
                                    className="sprite sprite-edit"
                                    title={ formatMessage({id: "LANG738"}) }
                                    onClick={ this._edit.bind(this, record) }>
                                </span>
                                <Popconfirm
                                    title={ <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4100"}, {0: formatMessage({id: "LANG82"}), 1: record.user_name})}}></span> }
                                    okText={ formatMessage({id: "LANG727"}) }
                                    cancelText={ formatMessage({id: "LANG726"}) }
                                    onConfirm={ this._delete.bind(this, record) }
                                >
                                    <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                                </Popconfirm>
                            </div>
                    } else {
                        return <div>
                                <span
                                    className="sprite sprite-edit"
                                    title={ formatMessage({id: "LANG738"}) }
                                    onClick={ this._edit.bind(this, record) }>
                                </span>
                                {
                                    role === 'privilege_1' && record.privilege === 1
                                        ? <span
                                                className="sprite sprite-del-disabled"
                                                title={ formatMessage({id: "LANG739"}) }>
                                            </span>
                                        : <Popconfirm
                                                title={ formatMessage({id: "LANG841"}) }
                                                okText={ formatMessage({id: "LANG727"}) }
                                                cancelText={ formatMessage({id: "LANG726"}) }
                                                onConfirm={ this._delete.bind(this, record) }
                                            >
                                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                                            </Popconfirm>
                                }
                            </div>
                    }
                }
            }]

        const pagination = {
                total: this.state.userList.length,
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
                    1: formatMessage({id: "LANG2802"})
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
                            className={role === 'privilege_0' ? '' : 'hidden'}
                        >
                            { formatMessage({id: "LANG2807"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="user_id"
                        columns={ columns }
                        dataSource={ this.state.userList }
                        showHeader={ !!this.state.userList.length }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(UserList)
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
            privilegeList: [],
            selectedRowKeys: [],
            loading: false,
            custom_num: 0
        }
    }
    componentDidMount() {
        this._getPrivilegeList()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        const { formatMessage } = this.props.intl

        if (this.state.custom_num >= 6) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG808"}, {0: 6, 1: formatMessage({id: "LANG5167"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            browserHistory.push('/maintenance/userManagement/privilege/add')
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
                "action": "deleteCustomPrivilege",
                "privilege_id": record.privilege_id
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._getPrivilegeList()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _edit = (record) => {
        browserHistory.push('/maintenance/userManagement/privilege/edit/' + record.privilege_id + "/" + record.privilege_name)
    }
    _getPrivilegeList = (
            params = {                
                item_num: 10000,
                sidx: "privilege_id",
                sord: "asc",
                page: 1 
            }
        ) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listCustomPrivilege',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const tmp_privilegeList = response.privilege_id || []
                    const custom_num = res.response.total_item - 4
                    let privilegeList = []
                    tmp_privilegeList.map(function(item) {
                        if (item.privilege_id !== 2) {
                            privilegeList.push(item)
                        }
                    })

                    this.setState({
                        privilegeList: privilegeList,
                        custom_num: custom_num
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

        this.setState({ selectedRowKeys })
    }
    _createOption(text, record, index) {
        const { formatMessage } = this.props.intl
        if (record.privilege_id >= 4) {
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
        } else if (record.privilege_id === 3 && record.level === 0) {
            return <div>
                    <span
                        className="sprite sprite-edit"
                        title={ formatMessage({id: "LANG738"}) }
                        onClick={ this._edit.bind(this, record) }>
                    </span>
                    <span
                        className="sprite sprite-del sprite-del-disabled"
                        title={ formatMessage({id: "LANG739"}) }>
                    </span>
                </div>
        } else {
            return <div>
                    <span
                        className="sprite sprite-edit sprite-edit-disabled"
                        title={ formatMessage({id: "LANG738"}) }>
                    </span>
                    <span
                        className="sprite sprite-del sprite-del-disabled"
                        title={ formatMessage({id: "LANG739"}) }>
                    </span>
                </div>
        }
    }
    render() {
        if (this.props.firstLoad) {
            this._getPrivilegeList()
            this.props.setFirstLoad('custom', false)
        }
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'privilege_name',
                dataIndex: 'privilege_name',
                title: formatMessage({id: "LANG5168"})
            }, {
                key: 'privilege_id',
                dataIndex: 'privilege_id',
                title: formatMessage({id: "LANG5172"}),
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
                        return <span>{ formatMessage({id: "LANG5167"}) }</span>
                    }
                }
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return this._createOption(text, record, index)
                }
            }]

        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG5167"})
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
                            { formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG5167"})}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="privilege_id"
                        columns={ columns }
                        dataSource={ this.state.privilegeList }
                        showHeader={ !!this.state.privilegeList.length }
                        pagination={ false }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(UserList)

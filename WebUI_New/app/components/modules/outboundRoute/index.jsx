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

class OutboundRoute extends Component {
    constructor(props) {
        super(props)

        this.state = {
            accountList: [],
            accountAryObj: {},
            selectedRowKeys: [],
            outboundRoutes: [],
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
        this._getOutboundRoutes()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        let confirmContent = ''
        const { formatMessage } = this.props.intl

        confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2698" })}}></span>

        if (!this.state.trunkList.length) {
            confirm({
                content: confirmContent,
                onOk() {
                    browserHistory.push('/extension-trunk/voipTrunk')
                },
                onCancel() {}
            })
        } else {
            browserHistory.push('/extension-trunk/outboundRoute/add')
        }
    }
    _blacklist = (record) => {
        browserHistory.push('/extension-trunk/outboundRoute/blacklist')
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
                "action": "deleteOutboundRoute",
                "outbound_route": record.outbound_rt_index
            },
            type: 'json',
            async: true,
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

                    this._getOutboundRoutes({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'sequence',
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
        browserHistory.push('/extension-trunk/outboundRoute/edit/' + record.outbound_rt_index + '/' + record.outbound_rt_name)
    }
    _createName = (text, record, index) => {
        const { formatMessage } = this.props.intl

        let name,
            disabled = record.out_of_service

        if (disabled === 'yes') {
            name = <div className="status-container unavailable">
                        <span
                            className="sprite sprite-status-unavailable"
                            title={ formatMessage({ id: "LANG273" }) }
                        ></span>
                        { text }
                    </div>
        } else {
            name = text
        }

        return name
    }
    _createPattern = (text, record, index) => {
        const pattern = text.split(',')
        const { formatMessage } = this.props.intl

        if (pattern.length <= 5) {
            return <div>
                    {
                        pattern.map(function(value, index) {
                            return <Tag key={ value }>{ value }</Tag>
                        }.bind(this))
                    }
                </div>
        } else {
            const content = <div>
                        {
                            pattern.map(function(value, index) {
                                if (index >= 4) {
                                    return <Tag key={ value }>{ value }</Tag>
                                }
                            }.bind(this))
                        }
                    </div>

            return <div>
                    {
                        [0, 1, 2, 3].map(function(value, index) {
                            return <Tag key={ pattern[value] }>{ pattern[value] }</Tag>
                        }.bind(this))
                    }
                    <Popover
                        title=""
                        content={ content }
                    >
                        <Badge
                            overflowCount={ 10 }
                            count={ pattern.length - 4 }
                        />
                    </Popover>
                </div>
        }
    }
    _createPermission = (text, record, index) => {
        let permission
        const { formatMessage } = this.props.intl

        if (text === 'internal') {
            permission = <span>{ formatMessage({ id: "LANG1071" }) }</span>
        } else if (text === 'local') {
            permission = <span>{ formatMessage({ id: "LANG1072" }) }</span>
        } else if (text === 'national') {
            permission = <span>{ formatMessage({ id: "LANG1073" }) }</span>
        } else if (text === 'international') {
            permission = <span>{ formatMessage({ id: "LANG1074" }) }</span>
        } else {
            permission = <span>{ formatMessage({ id: "LANG273" }) }</span>
        }

        return permission
    }
    _getOutboundRoutes = (
        params = {                
                item_num: 10,
                sidx: "sequence",
                sord: "asc",
                page: 1 
            }
        ) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listOutboundRoute',
                options: 'outbound_rt_name,outbound_rt_index,permission,sequence,pattern,out_of_service',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const outboundRoutes = response.outbound_route || []

                    let pagination = this.state.pagination

                    // Read total count from server
                    pagination.total = response.total_item

                    this.setState({
                        outboundRoutes: outboundRoutes,
                        trunkList: UCMGUI.isExist.getList('getTrunkList', formatMessage),
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
        let sorter_here = {}
        let pager = this.state.pagination

        pager.current = pagination.current
        pager.pageSize = pagination.pageSize

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

        this._getOutboundRoutes({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'sequence',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ selectedRowKeys })
    }
    _pingroups = () => {
        browserHistory.push('/extension-trunk/outboundRoute/pingroups')
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'sequence',
                dataIndex: 'sequence',
                title: formatMessage({id: "LANG240"}),
                sorter: true
            }, {
                key: 'outbound_rt_name',
                dataIndex: 'outbound_rt_name',
                title: formatMessage({id: "LANG656"}),
                sorter: true,
                render: (text, record, index) => (
                    this._createName(text, record, index)
                )
            }, {
                key: 'pattern',
                dataIndex: 'pattern',
                title: formatMessage({id: "LANG246"}),
                sorter: true,
                render: (text, record, index) => (
                    this._createPattern(text, record, index)
                )
            }, {
                key: 'permission',
                dataIndex: 'permission',
                title: formatMessage({id: "LANG1543"}),
                sorter: true,
                render: (text, record, index) => (
                    this._createPermission(text, record, index)
                )
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
                total: this.state.outboundRoutes.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                },
                showTotal: (total) => {
                    return formatMessage({ id: "LANG115" }) + total
                }
            }

        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG655"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG655"}) }
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
                            icon="solution"
                            type="primary"
                            size='default'
                            onClick={ this._blacklist }
                        >
                            { formatMessage({id: "LANG5336"}) }
                        </Button>
                        <Button
                            icon="database"
                            type="primary"
                            size='default'
                            onClick={ this._pingroups }
                        >
                            { formatMessage({id: "LANG4553"}) }
                        </Button>
                    </div>
                    <div className="function-description">
                        <span>{ formatMessage({id: "LANG1532"}) }</span>
                    </div>
                    <Table
                        columns={ columns }
                        rowKey="outbound_rt_index"
                        dataSource={ this.state.outboundRoutes }
                        showHeader={ !!this.state.outboundRoutes.length }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(OutboundRoute)
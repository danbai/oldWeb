'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag } from 'antd'

class Ivr extends Component {
    constructor(props) {
        super(props)
        this.state = {
            IVR: [],
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
        this._getIvr()
    }
    componentWillUnmount() {
        
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _getIvr = (
        params = {                
                item_num: 10,
                sidx: "extension",
                sord: "asc",
                page: 1 
            }
        ) => {
        const { formatMessage } = this.props.intl
        this.setState({loading: true})
        let IVR = {}

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listIVR',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const IVR = response.ivr || []
                    const pagination = this.state.pagination
                    pagination.total = res.response.total_item

                    this.setState({
                        loading: false,
                        IVR: IVR,
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

        this._getIvr({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'extension',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _createIvr = () => {
        browserHistory.push('/call-features/ivr/add')
    }
    _edit = (record) => {
        browserHistory.push('/call-features/ivr/edit/' + record.ivr_id + '/' + record.ivr_name)
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
                "action": "deleteIVR",
                "ivr": record.ivr_id
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

                    this._getIvr({
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
    render() {
        const {formatMessage} = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 
            1: formatMessage({id: "LANG647"})
        })

        const columns = [{
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG85"}),
                sorter: true
            }, {
                key: 'ivr_name',
                dataIndex: 'ivr_name',
                title: formatMessage({id: "LANG135"}),
                sorter: true
            }, {
                key: 'dial_extension',
                dataIndex: 'dial_extension',
                title: formatMessage({id: "LANG1445"}),
                sorter: true
            }, {
                key: 'dial_trunk',
                dataIndex: 'dial_trunk',
                title: formatMessage({id: "LANG1447"}),
                sorter: true
            }, {
                key: 'response_timeout',
                dataIndex: 'response_timeout',
                title: formatMessage({id: "LANG2540"}),
                sorter: true
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
                total: this.state.IVR.length,
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
        
        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG647"}) }
                    isDisplay= "hidden"
                />
                <div className="content">
                    <div className="top-button">
                        <Button 
                            icon="plus"
                            type="primary"
                            size="default"
                            onClick={this._createIvr} >
                            {formatMessage({id: "LANG766"})}
                        </Button>
                    </div>
                    <div className="content">
                        <p >
                            <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2320"})}} >
                            </span>
                        </p>
                    </div>
                    <Table
                        rowKey="extension"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        dataSource={ this.state.IVR }
                        showHeader={ !!this.state.IVR.length }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(Ivr)
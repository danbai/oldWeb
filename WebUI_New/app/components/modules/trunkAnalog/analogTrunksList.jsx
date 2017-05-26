'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Table, Form, Input, Modal, Button, Row, Col, Checkbox, message, Select, Tabs, Popconfirm } from 'antd'
import { FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"

const baseServerURl = api.apiHost

class AnalogTrunksList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            analogTrunk: [],
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
        this._listAnalogTrunk()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _listAnalogTrunk = (
        params = {
            item_num: 10,
            sidx: 'trunk_name',
            sord: 'asc',
            page: 1
        }
    ) => {
        this.setState({loading: true})
        $.ajax({
            url: baseServerURl,
            method: 'post',
            data: { 
                action: 'listAnalogTrunk',
                options: "trunk_name,trunk_index,chans,out_of_service,trunkmode",
                ...params
            },
            type: 'json',
            async: true,
            success: function(res) {
                let analogTrunk = res.response.analogtrunk
                const pagination = this.state.pagination
                // Read total count from server
                pagination.total = res.response.total_item

                this.setState({
                    analogTrunk: analogTrunk,
                    loading: false,
                    pagination
                })
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _deleteTrunk = (data) => {
        const { formatMessage } = this.props.intl

        let trunkIndex = data.trunk_index
        message.loading(formatMessage({id: "LANG825"}, {0: "LANG11"}), 0)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "deleteAnalogTrunk",
                "analogtrunk": trunkIndex
            },
            type: 'json',
            async: true,
            success: function(res) {
                var bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    // message.success(formatMessage({id: "LANG816"}))

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

                    this._listAnalogTrunk({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'trunk_name',
                        sord: this.state.sorter.order === "descend" ? "desc" : "asc"
                    })

                    this.setState({
                        pagination: pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _createAnalogTrunk = () => {
        browserHistory.push('/extension-trunk/analogTrunk/add')
    }
    _editTrunk = (record) => {
        browserHistory.push('/extension-trunk/analogTrunk/edit/' + record.trunk_index + "/" + record.trunk_name)
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

        this._listAnalogTrunk({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'trunk_name',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    render() {
        const {formatMessage} = this.props.intl

        const columns = [
            {
                title: formatMessage({id: "LANG83"}),
                dataIndex: 'trunk_name',
                sorter: true
            }, {
                title: formatMessage({id: "LANG273"}),
                dataIndex: 'out_of_service',
                sorter: true
            }, {
                title: formatMessage({id: "LANG3216"}),
                dataIndex: 'trunkmode',
                sorter: true
            }, {
                title: formatMessage({id: "LANG232"}),
                dataIndex: 'chans',
                sorter: true
            }, { 
                title: formatMessage({id: "LANG74"}), 
                dataIndex: '', 
                key: 'x', 
                render: (text, record, index) => (
                    <span>
                        <span className="sprite sprite-edit" onClick={this._editTrunk.bind(this, record)}></span>
                        <Popconfirm 
                            title={
                            <FormattedHTMLMessage
                                id='LANG4471'
                                values={{
                                    0: record.trunk_name
                                }}
                            />} 
                            onConfirm={() => this._deleteTrunk(record)}>
                            <span className="sprite sprite-del" ></span>
                        </Popconfirm>
                    </span>
                ) 
            }
        ]
        
        const pagination = {
            total: this.state.analogTrunk.length,
            showSizeChanger: true,
            onShowSizeChange(current, pageSize) {
                console.log('Current: ', current, '; PageSize: ', pageSize)
            },
            onChange(current) {
                console.log('Current: ', current)
            }
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <div className="top-button">
                        <Button icon="plus" type="primary" size="default" onClick={this._createAnalogTrunk} >
                            {formatMessage({id: "LANG762"})}
                        </Button>
                    </div>
                    <Table 
                        rowSelection={undefined} 
                        columns={columns} 
                        dataSource={this.state.analogTrunk} 
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

AnalogTrunksList.defaultProps = {
}

export default injectIntl(AnalogTrunksList)
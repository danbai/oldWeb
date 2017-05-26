'use strict'

import React, { Component, PropTypes } from 'react'
import { browserHistory } from 'react-router'
import { Table, message, Popconfirm } from 'antd'
import { FormattedMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"

class IvrList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ivr: []
        }
    }
    componentDidMount() {
        this._listIvr()
    }
    _listIvr = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'listAnalogTrunk',
                options: "trunk_name,trunk_index,chans,out_of_service,trunkmode"
            },
            type: 'json',
            async: true,
            success: function(res) {
                let analogTrunk = res.response.analogtrunk
                this.setState({
                    analogTrunk: analogTrunk
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
        message.loading(formatMessage({ id: "LANG825" }, {0: "LANG11"}), 0)

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
                    // message.success(formatMessage({ id: "LANG816" }))
                    this._listAnalogTrunk()
                }
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _editTrunk = (e) => {
        browserHistory.push('/extension-trunk/analogTrunk/editAnalogTrunk')
    }
    render() {
        const {formatMessage} = this.props.intl

        const columns = [
            {
                title: formatMessage({id: "LANG83"}),
                dataIndex: 'trunk_name'
            }, {
                title: formatMessage({id: "LANG273"}),
                dataIndex: 'out_of_service',
                sorter: (a, b) => a.age - b.age
            }, {
                title: formatMessage({id: "LANG3216"}),
                dataIndex: 'trunkmode'
            }, {
                title: formatMessage({id: "LANG232"}),
                dataIndex: 'chans'
            }, { 
                title: formatMessage({id: "LANG74"}), 
                dataIndex: '', 
                key: 'x', 
                render: (text, record, index) => (
                    <span>
                        <span className="sprite sprite-edit" onClick={this._editTrunk.bind(this, record)}></span>
                        <Popconfirm title="确定要删除吗？" onConfirm={() => this._deleteTrunk(record)}>
                            <span className="sprite sprite-del" ></span>
                        </Popconfirm>
                    </span>
                ) 
            }
        ]
        
        const pagination = {
            total: this.state.ivr.length,
            showSizeChanger: true,
            onShowSizeChange(current, pageSize) {
                console.log('Current: ', current, '; PageSize: ', pageSize)
            },
            onChange(current) {
                console.log('Current: ', current)
            }
        }

        return (
            <Table rowSelection={false} columns={columns} dataSource={this.state.ivr} pagination={pagination} />
        )
    }
}

IvrList.defaultProps = {
    
}

export default injectIntl(IvrList)
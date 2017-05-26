'use strict'

import { Table } from 'antd'
import UCMGUI from "../../api/ucmgui"
import { injectIntl } from 'react-intl'
import React, { Component, PropTypes } from 'react'

class ByAgent extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl

        const agentColumns = [{
                title: formatMessage({id: "LANG143"}),
                dataIndex: 'agent',
                key: 'agent',
                sorter: (a, b) => a.agent - b.agent
            }, {
                title: formatMessage({id: "LANG5409"}),
                dataIndex: 'received_calls',
                key: 'received_calls',
                sorter: (a, b) => a.received_calls - b.received_calls
            }, {
                title: formatMessage({id: "LANG5362"}),
                dataIndex: 'answered_calls',
                key: 'answered_calls',
                sorter: (a, b) => a.answered_calls - b.answered_calls
            }, {
                title: formatMessage({id: "LANG5624"}),
                dataIndex: 'abandoned_calls',
                key: 'abandoned_calls',
                sorter: (a, b) => a.abandoned_calls - b.abandoned_calls
            }, {
                title: formatMessage({id: "LANG5363"}),
                dataIndex: 'unanswered_calls',
                key: 'unanswered_calls',
                sorter: (a, b) => a.unanswered_calls - b.unanswered_calls
            }, {
                title: formatMessage({id: "LANG5410"}),
                dataIndex: 'transferred_calls',
                key: 'transferred_calls',
                sorter: (a, b) => a.transferred_calls - b.transferred_calls
            }, {
                title: formatMessage({id: "LANG5365"}),
                dataIndex: 'answered_rate',
                key: 'answered_rate',
                sorter: (a, b) => a.answered_rate - b.answered_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG5625"}),
                dataIndex: 'abandoned_rate',
                key: 'abandoned_rate',
                sorter: (a, b) => a.abandoned_rate - b.abandoned_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG5366"}),
                dataIndex: 'unanswered_rate',
                key: 'unanswered_rate',
                sorter: (a, b) => a.unanswered_rate - b.unanswered_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG5411"}),
                dataIndex: 'transferred_rate',
                key: 'transferred_rate',
                sorter: (a, b) => a.transferred_rate - b.transferred_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG5357"}),
                dataIndex: 'talk_time_rate',
                key: 'talk_time_rate',
                sorter: (a, b) => a.talk_time_rate - b.talk_time_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG2238"}),
                dataIndex: 'talk_time',
                key: 'talk_time',
                sorter: (a, b) => a.talk_time - b.talk_time,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5606"}),
                dataIndex: 'wait_time',
                key: 'wait_time',
                sorter: (a, b) => a.wait_time - b.wait_time,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5370"}),
                dataIndex: 'avg_talk',
                key: 'avg_talk',
                sorter: (a, b) => a.avg_talk - b.avg_talk,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5371"}),
                dataIndex: 'avg_wait',
                key: 'avg_wait',
                sorter: (a, b) => a.avg_wait - b.avg_wait,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5368"}),
                dataIndex: 'agent_login',
                key: 'agent_login',
                sorter: (a, b) => a.agent_login - b.agent_login
            }, {
                title: formatMessage({id: "LANG5369"}),
                dataIndex: 'agent_logoff',
                key: 'agent_logoff',
                sorter: (a, b) => a.agent_logoff - b.agent_logoff
            }]

        const pagination = {
                total: this.props.QueueStatDistributionByAgent.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }

        return (
            <Table
                rowKey="agent"
                columns={ agentColumns }
                pagination={ pagination }
                dataSource={ this.props.QueueStatDistributionByAgent }
            />
        )
    }
}

module.exports = injectIntl(ByAgent)
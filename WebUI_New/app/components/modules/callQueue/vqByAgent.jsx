'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'
import UCMGUI from "../../api/ucmgui"

class VQByAgent extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl
        const vqGeneralColumns = this.props.vqGeneralColumns

        const agentColumn = [{
                title: formatMessage({id: "LANG143"}),
                dataIndex: 'agent',
                key: 'agent',
                sorter: (a, b) => a.agent - b.agent
            }, {
                title: formatMessage({id: "LANG5409"}),
                dataIndex: 'total_calls',
                key: 'total_calls',
                sorter: (a, b) => a.total_calls - b.total_calls
            }, {
                title: formatMessage({id: "LANG5362"}),
                dataIndex: 'answered_calls',
                key: 'answered_calls',
                sorter: (a, b) => a.answered_calls - b.answered_calls
            }, {
                title: formatMessage({id: "LANG5607"}),
                dataIndex: 'agent_unanswered_calls',
                key: 'agent_unanswered_calls',
                sorter: (a, b) => a.agent_unanswered_calls - b.agent_unanswered_calls
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
            }]

        const pagination = {
                total: this.props.VQStatDistributionByAgent.length,
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
                rowKey="queue"
                columns={ agentColumn }
                pagination={ pagination }
                dataSource={ this.props.VQStatDistributionByAgent }
            />
        )
    }
}

module.exports = injectIntl(VQByAgent)
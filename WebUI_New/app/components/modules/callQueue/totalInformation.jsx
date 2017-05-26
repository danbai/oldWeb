'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'

class TotalInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl

        const infoColumns = [{
                key: 'received_calls',
                dataIndex: 'received_calls',
                title: formatMessage({id: "LANG5409"})
            }, {
                key: 'answered_calls',
                dataIndex: 'answered_calls',
                title: formatMessage({id: "LANG5362"})
            }, {
                key: 'unanswered_calls',
                dataIndex: 'unanswered_calls',
                title: formatMessage({id: "LANG5363"})
            }, {
                key: 'abandoned_calls',
                dataIndex: 'abandoned_calls',
                title: formatMessage({id: "LANG5364"})
            }, {
                key: 'transferred_calls',
                dataIndex: 'transferred_calls',
                title: formatMessage({id: "LANG5410"})
            }, {
                key: 'answered_rate',
                dataIndex: 'answered_rate',
                title: formatMessage({id: "LANG5365"})
            }, {
                key: 'unanswered_rate',
                dataIndex: 'unanswered_rate',
                title: formatMessage({id: "LANG5366"})
            }, {
                key: 'abandoned_rate',
                dataIndex: 'abandoned_rate',
                title: formatMessage({id: "LANG5367"})
            }, {
                key: 'transferred_rate',
                dataIndex: 'transferred_rate',
                title: formatMessage({id: "LANG5411"})
            }, {
                key: 'agent_login',
                dataIndex: 'agent_login',
                title: formatMessage({id: "LANG5368"})
            }, {
                key: 'agent_logoff',
                dataIndex: 'agent_logoff',
                title: formatMessage({id: "LANG5369"})
            }, {
                key: 'avg_talk',
                dataIndex: 'avg_talk',
                title: formatMessage({id: "LANG5370"})
            }, {
                key: 'avg_wait',
                dataIndex: 'avg_wait',
                title: formatMessage({id: "LANG5371"})
            }]

        return (
            <Table
                pagination={ false }
                columns={ infoColumns }
                dataSource={ this.props.QueueStatTotal }
            />
        )
    }
}

module.exports = injectIntl(TotalInfo)
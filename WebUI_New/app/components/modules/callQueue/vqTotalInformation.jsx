'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'

class VQTotalInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl

        const infoColumns = [{
                key: 'total_calls',
                dataIndex: 'total_calls',
                title: formatMessage({id: "LANG5409"})
            }, {
                key: 'answered_calls',
                dataIndex: 'answered_calls',
                title: formatMessage({id: "LANG5362"})
            }, {
                key: 'agent_unanswered_calls',
                dataIndex: 'agent_unanswered_calls',
                title: formatMessage({id: "LANG5607"})
            }, {
                key: 'usr_unanswered_calls',
                dataIndex: 'usr_unanswered_calls',
                title: formatMessage({id: "LANG5608"})
            }, {
                title: formatMessage({id: "LANG5410"}),
                dataIndex: 'transferred_calls',
                key: 'transferred_calls'
            }, {
                key: 'answered_rate',
                dataIndex: 'answered_rate',
                title: formatMessage({id: "LANG5365"})
            }, {
                key: 'unanswered_rate',
                dataIndex: 'unanswered_rate',
                title: formatMessage({id: "LANG5366"})
            }, {
                title: formatMessage({id: "LANG5411"}),
                dataIndex: 'transferred_rate',
                key: 'transferred_rate'
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
                dataSource={ this.props.VQStatTotal }
            />
        )
    }
}

module.exports = injectIntl(VQTotalInfo)
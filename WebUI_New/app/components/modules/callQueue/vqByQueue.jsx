'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'

class VQByQueue extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl
        const vqGeneralColumns = this.props.vqGeneralColumns

        const queueColumn = [{
                title: formatMessage({id: "LANG91"}),
                dataIndex: 'queue',
                key: 'queue',
                sorter: (a, b) => a.queue - b.queue
            }]

        const pagination = {
                total: this.props.VQStatDistributionByQueue.length,
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
                pagination={ pagination }
                columns={ queueColumn.concat(vqGeneralColumns) }
                dataSource={ this.props.VQStatDistributionByQueue }
            />
        )
    }
}

module.exports = injectIntl(VQByQueue)
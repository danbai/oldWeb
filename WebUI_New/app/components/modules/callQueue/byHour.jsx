'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'

class ByHour extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl
        const generalColumns = this.props.generalColumns

        const hourColumn = [{
                title: formatMessage({id: "LANG4545"}),
                dataIndex: 'hour',
                key: 'hour',
                sorter: (a, b) => a.hour - b.hour
            }]

        const pagination = {
                total: this.props.QueueStatDistributionByHour.length,
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
                rowKey="hour"
                pagination={ pagination }
                columns={ hourColumn.concat(generalColumns) }
                dataSource={ this.props.QueueStatDistributionByHour }
            />
        )
    }
}

module.exports = injectIntl(ByHour)
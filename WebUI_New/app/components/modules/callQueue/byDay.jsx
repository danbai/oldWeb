'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'

class ByDay extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl
        const generalColumns = this.props.generalColumns

        const dayColumn = [{
                title: formatMessage({id: "LANG242"}),
                dataIndex: 'date',
                key: 'date'
            }]

        const pagination = {
                total: this.props.QueueStatDistributionByDay.length,
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
                rowKey="day"
                pagination={ pagination }
                columns={ dayColumn.concat(generalColumns) }
                dataSource={ this.props.QueueStatDistributionByDay }
            />
        )
    }
}

module.exports = injectIntl(ByDay)
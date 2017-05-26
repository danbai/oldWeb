'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'

class VQByDayOfWeek extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl
        const vqGeneralColumns = this.props.vqGeneralColumns

        const dayOfWeekColumn = [{
                title: formatMessage({id: "LANG242"}),
                dataIndex: 'day',
                key: 'day'
            }]

        const pagination = {
                total: this.props.VQStatDistributionByDayOfWeek.length,
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
                columns={ dayOfWeekColumn.concat(vqGeneralColumns) }
                dataSource={ this.props.VQStatDistributionByDayOfWeek }
            />
        )
    }
}

module.exports = injectIntl(VQByDayOfWeek)
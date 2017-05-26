'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'

class VQByDay extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl
        const vqGeneralColumns = this.props.vqGeneralColumns

        const dayColumn = [{
                title: formatMessage({id: "LANG242"}),
                dataIndex: 'date',
                key: 'date'
            }]

        const pagination = {
                total: this.props.VQStatDistributionByDay.length,
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
                columns={ dayColumn.concat(vqGeneralColumns) }
                dataSource={ this.props.VQStatDistributionByDay }
            />
        )
    }
}

module.exports = injectIntl(VQByDay)
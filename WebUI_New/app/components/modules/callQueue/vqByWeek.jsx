'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'

class VQByWeek extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl
        const vqGeneralColumns = this.props.vqGeneralColumns

        const weekColumn = [{
                title: formatMessage({id: "LANG243"}),
                dataIndex: 'week',
                key: 'week'
            }]

        const pagination = {
                total: this.props.VQStatDistributionByWeek.length,
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
                columns={ weekColumn.concat(vqGeneralColumns) }
                dataSource={ this.props.VQStatDistributionByWeek }
            />
        )
    }
}

module.exports = injectIntl(VQByWeek)
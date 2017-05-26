'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'

class VQByHour extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl
        const vqGeneralColumns = this.props.vqGeneralColumns

        const hourColumn = [{
                title: formatMessage({id: "LANG4545"}),
                dataIndex: 'hour',
                key: 'hour',
                sorter: (a, b) => a.hour - b.hour
            }]

        const pagination = {
                total: this.props.VQStatDistributionByHour.length,
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
                columns={ hourColumn.concat(vqGeneralColumns) }
                dataSource={ this.props.VQStatDistributionByHour }
            />
        )
    }
}

module.exports = injectIntl(VQByHour)
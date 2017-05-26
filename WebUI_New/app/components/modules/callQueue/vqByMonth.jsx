'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Table } from 'antd'

class VQByMonth extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl
        const vqGeneralColumns = this.props.vqGeneralColumns

        const monthColumn = [{
                title: formatMessage({id: "LANG244"}),
                dataIndex: 'month',
                key: 'month'
            }]

        const pagination = {
                total: this.props.VQStatDistributionByMonth.length,
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
                columns={ monthColumn.concat(vqGeneralColumns) }
                dataSource={ this.props.VQStatDistributionByMonth }
            />
        )
    }
}

module.exports = injectIntl(VQByMonth)
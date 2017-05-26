'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Col, Row, Table } from 'antd'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'

class ByMonth extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const { formatMessage } = this.props.intl
        const generalColumns = this.props.generalColumns

        const monthColumn = [{
                title: formatMessage({id: "LANG244"}),
                dataIndex: 'month',
                key: 'month'
            }]

        const pagination = {
                total: this.props.QueueStatDistributionByMonth.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }

        return (
            <div>
                <Table
                    rowKey="month"
                    pagination={ false }
                    columns={ monthColumn.concat(generalColumns) }
                    dataSource={ this.props.QueueStatDistributionByMonth }
                />
                <Row gutter={ 16 }>
                    <Col offset={ 3 } xs={{ span: 18 }} sm={{ span: 18 }} md={{ span: 18 }} lg={{ span: 18 }}>
                    </Col>
                </Row>
            </div>
        )
    }
}

module.exports = injectIntl(ByMonth)
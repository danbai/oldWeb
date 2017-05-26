'use strict'

import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Col, Row, Table } from 'antd'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'

class ByWeek extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    // componentDidUpdate() {
    //     const { formatMessage } = this.props.intl
    //     const chartByWeek = echarts.init(document.getElementById('chartByWeek'))
    //     const option = {
    //             title: {
    //                 left: 'center',
    //                 text: formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG5358"})})
    //             },
    //             tooltip: {},
    //             legend: {
    //                 padding: [35, 0, 0, 20],
    //                 data: [
    //                     formatMessage({id: "LANG5362"}),
    //                     formatMessage({id: "LANG5363"}),
    //                     formatMessage({id: "LANG5370"}),
    //                     formatMessage({id: "LANG5371"})
    //                 ]
    //             },
    //             xAxis: {
    //                 data: [
    //                     formatMessage({id: "LANG3585"}),
    //                     formatMessage({id: "LANG3579"}),
    //                     formatMessage({id: "LANG3580"}),
    //                     formatMessage({id: "LANG3581"}),
    //                     formatMessage({id: "LANG3582"}),
    //                     formatMessage({id: "LANG3583"}),
    //                     formatMessage({id: "LANG3584"})
    //                 ]
    //             },
    //             yAxis: {},
    //             series: [{
    //                 name: formatMessage({id: "LANG5362"}),
    //                 type: 'bar',
    //                 data: [40, 40, 40, 40, 40, 40, 40]
    //             }, {
    //                 name: formatMessage({id: "LANG5363"}),
    //                 type: 'bar',
    //                 data: [40, 40, 40, 40, 40, 40, 40]
    //             }, {
    //                 name: formatMessage({id: "LANG5370"}),
    //                 type: 'bar',
    //                 data: [40, 40, 40, 40, 40, 40, 40]
    //             }, {
    //                 name: formatMessage({id: "LANG5371"}),
    //                 type: 'bar',
    //                 data: [40, 40, 40, 40, 40, 40, 40]
    //             }]
    //         }

    //     chartByWeek.setOption(option)
    // }
    render() {
        const { formatMessage } = this.props.intl
        const generalColumns = this.props.generalColumns
        const weekColumn = [{
                title: formatMessage({id: "LANG243"}),
                dataIndex: 'week',
                key: 'week'
            }]
        const pagination = {
                total: this.props.QueueStatDistributionByWeek.length,
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
                    rowKey="week"
                    scroll={{ x: 2000 }}
                    pagination={ pagination }
                    columns={ weekColumn.concat(generalColumns) }
                    dataSource={ this.props.QueueStatDistributionByWeek }
                />
                <Row gutter={ 16 }>
                    <Col offset={ 3 } xs={{ span: 18 }} sm={{ span: 18 }} md={{ span: 18 }} lg={{ span: 18 }}>
                        {/* <div id="chartByWeek" className="chart" /> */}
                    </Col>
                </Row>
            </div>
        )
    }
}

module.exports = injectIntl(ByWeek)
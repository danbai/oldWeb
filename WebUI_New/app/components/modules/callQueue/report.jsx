'use strict'

import ByDay from './byDay'
import ByHour from './byHour'
import ByWeek from './byWeek'
import ByQueue from './byQueue'
import ByAgent from './byAgent'
import ByMonth from './byMonth'
import ByDayOfWeek from './byDayOfWeek'
import VQByDay from './vqByDay'
import VQByHour from './vqByHour'
import VQByWeek from './vqByWeek'
import VQByMonth from './vqByMonth'
import VQByQueue from './vqByQueue'
import VQByAgent from './vqByAgent'
import VQByDayOfWeek from './vqByDayOfWeek'
import TotalInformation from './totalInformation'
import ReportInformation from './reportInformation'
import VQTotalInformation from './vqTotalInformation'

import $ from 'jquery'
import _ from 'underscore'
import UCMGUI from '../../api/ucmgui'
import { Card, Col, Row, Table } from 'antd'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import '../../../css/call-queue'

class Report extends Component {
    componentDidMount() {
        $('#queueReport').height(document.body.clientHeight - 400)
    }
    render() {
        const { formatMessage } = this.props.intl

        const generalColumns = [{
                title: formatMessage({id: "LANG5409"}),
                dataIndex: 'received_calls',
                key: 'received_calls',
                sorter: (a, b) => a.received_calls - b.received_calls
            }, {
                title: formatMessage({id: "LANG5362"}),
                dataIndex: 'answered_calls',
                key: 'answered_calls',
                sorter: (a, b) => a.answered_calls - b.answered_calls
            }, {
                title: formatMessage({id: "LANG5363"}),
                dataIndex: 'unanswered_calls',
                key: 'unanswered_calls',
                sorter: (a, b) => a.unanswered_calls - b.unanswered_calls
            }, {
                title: formatMessage({id: "LANG5364"}),
                dataIndex: 'abandoned_calls',
                key: 'abandoned_calls',
                sorter: (a, b) => a.abandoned_calls - b.abandoned_calls
            }, {
                title: formatMessage({id: "LANG5410"}),
                dataIndex: 'transferred_calls',
                key: 'transferred_calls',
                sorter: (a, b) => a.transferred_calls - b.transferred_calls
            }, {
                title: formatMessage({id: "LANG5365"}),
                dataIndex: 'answered_rate',
                key: 'answered_rate',
                sorter: (a, b) => a.answered_rate - b.answered_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG5366"}),
                dataIndex: 'unanswered_rate',
                key: 'unanswered_rate',
                sorter: (a, b) => a.unanswered_rate - b.unanswered_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG5367"}),
                dataIndex: 'abandoned_rate',
                key: 'abandoned_rate',
                sorter: (a, b) => a.abandoned_rate - b.abandoned_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG5411"}),
                dataIndex: 'transferred_rate',
                key: 'transferred_rate',
                sorter: (a, b) => a.transferred_rate - b.transferred_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG2238"}),
                dataIndex: 'talk_time',
                key: 'talk_time',
                sorter: (a, b) => a.talk_time - b.talk_time,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5606"}),
                dataIndex: 'wait_time',
                key: 'wait_time',
                sorter: (a, b) => a.wait_time - b.wait_time,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5370"}),
                dataIndex: 'avg_talk',
                key: 'avg_talk',
                sorter: (a, b) => a.avg_talk - b.avg_talk,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5371"}),
                dataIndex: 'avg_wait',
                key: 'avg_wait',
                sorter: (a, b) => a.avg_wait - b.avg_wait,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5368"}),
                dataIndex: 'agent_login',
                key: 'agent_login',
                sorter: (a, b) => a.agent_login - b.agent_login
            }, {
                title: formatMessage({id: "LANG5369"}),
                dataIndex: 'agent_logoff',
                key: 'agent_logoff',
                sorter: (a, b) => a.agent_logoff - b.agent_logoff
            }]

        const vqGeneralColumns = [{
                title: formatMessage({id: "LANG5409"}),
                dataIndex: 'total_calls',
                key: 'total_calls',
                sorter: (a, b) => a.total_calls - b.total_calls
            }, {
                title: formatMessage({id: "LANG5362"}),
                dataIndex: 'answered_calls',
                key: 'answered_calls',
                sorter: (a, b) => a.answered_calls - b.answered_calls
            }, {
                title: formatMessage({id: "LANG5607"}),
                dataIndex: 'agent_unanswered_calls',
                key: 'agent_unanswered_calls',
                sorter: (a, b) => a.agent_unanswered_calls - b.agent_unanswered_calls
            }, {
                title: formatMessage({id: "LANG5608"}),
                dataIndex: 'usr_unanswered_calls',
                key: 'usr_unanswered_calls',
                sorter: (a, b) => a.usr_unanswered_calls - b.usr_unanswered_calls
            }, {
                title: formatMessage({id: "LANG5410"}),
                dataIndex: 'transferred_calls',
                key: 'transferred_calls',
                sorter: (a, b) => a.transferred_calls - b.transferred_calls
            }, {
                title: formatMessage({id: "LANG5365"}),
                dataIndex: 'answered_rate',
                key: 'answered_rate',
                sorter: (a, b) => a.answered_rate - b.answered_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG5366"}),
                dataIndex: 'unanswered_rate',
                key: 'unanswered_rate',
                sorter: (a, b) => a.unanswered_rate - b.unanswered_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG5411"}),
                dataIndex: 'transferred_rate',
                key: 'transferred_rate',
                sorter: (a, b) => a.transferred_rate - b.transferred_rate,
                render: (text, record, index) => {
                    return parseFloat(text).toFixed(2)
                }
            }, {
                title: formatMessage({id: "LANG2238"}),
                dataIndex: 'talk_time',
                key: 'talk_time',
                sorter: (a, b) => a.talk_time - b.talk_time,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5606"}),
                dataIndex: 'wait_time',
                key: 'wait_time',
                sorter: (a, b) => a.wait_time - b.wait_time,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5370"}),
                dataIndex: 'avg_talk',
                key: 'avg_talk',
                sorter: (a, b) => a.avg_talk - b.avg_talk,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                title: formatMessage({id: "LANG5371"}),
                dataIndex: 'avg_wait',
                key: 'avg_wait',
                sorter: (a, b) => a.avg_wait - b.avg_wait,
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }]

        let checkedValues = this.props.CheckedValues

        return (
            <div className="app-content-queue-report" id="queueReport">
                <Row
                    style={{ margin: '10px 0' }}
                    className={ (_.indexOf(checkedValues, 'getQueueReport') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5352"}) } className="ant-card-custom">
                            <ReportInformation
                                QueueReport={ this.props.QueueReport }
                                ExtensionGroup= { this.props.ExtensionGroup }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'getQueueStatTotal') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5353"}) } className="ant-card-custom">
                            <TotalInformation
                                QueueStatTotal={ this.props.QueueStatTotal }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listQueueStatDistributionByQueue') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG5355"})}) } className="ant-card-custom">
                            <ByQueue
                                generalColumns={ generalColumns }
                                QueueStatDistributionByQueue={ this.props.QueueStatDistributionByQueue }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listQueueStatDistributionByAgent') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG5356"})}) } className="ant-card-custom">
                            <ByAgent
                                QueueStatDistributionByAgent={ this.props.QueueStatDistributionByAgent }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listQueueStatDistributionByHour') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG201"})}) } className="ant-card-custom">
                            <ByHour
                                generalColumns={ generalColumns }
                                QueueStatDistributionByHour={ this.props.QueueStatDistributionByHour }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listQueueStatDistributionByDay') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG200"})}) } className="ant-card-custom">
                            <ByDay
                                generalColumns={ generalColumns }
                                QueueStatDistributionByDay={ this.props.QueueStatDistributionByDay }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listQueueStatDistributionByDayOfWeek') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG5358"})}) } className="ant-card-custom">
                            <ByDayOfWeek
                                generalColumns={ generalColumns }
                                QueueStatDistributionByDayOfWeek={ this.props.QueueStatDistributionByDayOfWeek }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listQueueStatDistributionByWeek') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG199"})}) } className="ant-card-custom">
                            <ByWeek
                                generalColumns={ generalColumns }
                                QueueStatDistributionByWeek={ this.props.QueueStatDistributionByWeek } 
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listQueueStatDistributionByMonth') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5354"}, {0: formatMessage({id: "LANG198"})}) } className="ant-card-custom">
                            <ByMonth
                                generalColumns={ generalColumns }
                                QueueStatDistributionByMonth={ this.props.QueueStatDistributionByMonth }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'getVQStatTotal') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5412"}) } className="ant-card-custom">
                            <VQTotalInformation
                                VQStatTotal={ this.props.VQStatTotal }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listVQStatDistributionByQueue') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG5355"})}) } className="ant-card-custom">
                            <VQByQueue
                                vqGeneralColumns={ vqGeneralColumns }
                                VQStatDistributionByQueue={ this.props.VQStatDistributionByQueue }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listVQStatDistributionByAgent') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG5356"})}) } className="ant-card-custom">
                            <VQByAgent
                                vqGeneralColumns={ vqGeneralColumns }
                                VQStatDistributionByAgent={ this.props.VQStatDistributionByAgent }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listVQStatDistributionByDay') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG200"})}) } className="ant-card-custom">
                            <VQByDay
                                vqGeneralColumns={ vqGeneralColumns }
                                VQStatDistributionByDay={ this.props.VQStatDistributionByDay }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listVQStatDistributionByHour') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG201"})}) } className="ant-card-custom">
                            <VQByHour
                                vqGeneralColumns={ vqGeneralColumns }
                                VQStatDistributionByHour={ this.props.VQStatDistributionByHour }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listVQStatDistributionByDayOfWeek') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG5358"})}) } className="ant-card-custom">
                            <VQByDayOfWeek
                                vqGeneralColumns={ vqGeneralColumns }
                                VQStatDistributionByDayOfWeek={ this.props.VQStatDistributionByDayOfWeek }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listVQStatDistributionByWeek') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG199"})}) } className="ant-card-custom">
                            <VQByWeek
                                vqGeneralColumns={ vqGeneralColumns }
                                VQStatDistributionByWeek={ this.props.VQStatDistributionByWeek }
                            />
                        </Card>
                    </Col>
                </Row>
                <Row
                    style={{ margin: '10px 0 20px 0' }}
                    className={ (_.indexOf(checkedValues, 'listVQStatDistributionByMonth') > -1) ? 'display-block' : 'hidden' }
                >
                    <Col>
                        <Card title={ formatMessage({id: "LANG5413"}, {0: formatMessage({id: "LANG198"})}) } className="ant-card-custom">
                            <VQByMonth
                                vqGeneralColumns={ vqGeneralColumns }
                                VQStatDistributionByMonth={ this.props.VQStatDistributionByMonth }
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

module.exports = injectIntl(Report)
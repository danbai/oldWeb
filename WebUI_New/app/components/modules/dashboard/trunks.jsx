import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Table, Card, Row, Col } from 'antd'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'

class Trunks extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
        this.props.listAllTrunk()
        this._showChart()
    }
    componentWillUnmount() {
    }
    _showChart = () => {
        let option = {
            // tooltip : {
            //     trigger: 'item',
            //     formatter: "{a} <br/>{b} : {c} ({d}%)"
            // },
            color: ['#3F7BF2', '#FF4E4E', '#FE980E', '#C0C5CC'],
            toolbox: {
                show: false,
                feature: {
                    mark: {show: true},
                    dataView: {show: true, readOnly: false},
                    magicType: {
                        show: true,
                        type: ['pie', 'funnel'],
                        option: {
                            funnel: {
                                x: '25%',
                                width: '50%',
                                funnelAlign: 'center',
                                max: 1548
                            }
                        }
                    },
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            series: [
                {
                    name: 'trunks',
                    type: 'pie',
                    radius: ['50%', '60%'],
                    itemStyle: {
                        normal: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        },
                        emphasis: {
                            label: {
                                show: true,
                                position: 'center',
                                textStyle: {
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            }
                        }
                    },
                    hoverAnimation: false,
                    data: [
                        {value: 335, name: 'available'},
                        {value: 310, name: 'abnormal'},
                        {value: 234, name: 'busy'},
                        {value: 135, name: 'unmonitored'}
                    ]
                }
            ]
        }
        let trunksPercent = echarts.init(document.getElementById('trunksPercent'))
        trunksPercent.setOption(option)
    }
    _createStatus = (text, record, index) => {
        const {formatMessage} = this.props.intl

        // this._showChart()

        let status = record.status ? record.status : "Unavailable",
            statusLower = status.toLowerCase(),
            disabled = record.out_of_service

        if (disabled === 'yes') {
            // disable
            status = <span className="sprite-unmonitored" title={formatMessage({ id: "LANG273" })} ></span>
        } else {
            if (statusLower === 'unavailable' || statusLower === 'unvailable') {
                // unavailable
                status = <span className="sprite sprite-abnormal" title={formatMessage({ id: "LANG113" })} ></span>
            } else if (statusLower === 'available') {
                // available
                status = <span className="sprite sprite-available" title={formatMessage({ id: "LANG110" })} ></span>
            } else if (statusLower === 'busy') {
                // busy
                status = <span className="sprite sprite-busy" title={formatMessage({ id: "LANG2237" })} ></span>
            } else if (statusLower === 'unreachable') {
                // unreachable
                status = <span className="sprite sprite-abnormal" title={formatMessage({ id: "LANG2394" })} ></span>
            } else if (statusLower === 'unmonitored') {
                // unmonitored
                status = <span className="sprite sprite-unmonitored" title={formatMessage({ id: "LANG2395" })} ></span>
            } else if (statusLower === 'ok' || statusLower === 'reachable') {
                // reachable
                status = <span className="sprite sprite-available" title={formatMessage({ id: "LANG2396" })} ></span>
            } else if (statusLower === 'lagged') {
                // lagged
                status = <span className="sprite sprite-available" title={formatMessage({ id: "LANG2397" })} ></span>
            } else if (statusLower === 'registered') {
                // registered
                status = <span className="sprite sprite-available" title={formatMessage({ id: "LANG2398" })} ></span>
            } else if (statusLower === 'unregistered') {
                // unregistered
                status = <span className="sprite sprite-abnormal" title={formatMessage({ id: "LANG2399" })} ></span>
            } else if (statusLower === 'failed') {
                // failed
                status = <span className="sprite sprite-abnormal" title={formatMessage({ id: "LANG2405" })} ></span>
            } else if (statusLower === 'unknown') {
                // unknown
                status = <span className="sprite sprite-unmonitored" title={formatMessage({ id: "LANG2403" })} ></span>
            } else if (statusLower === 'rejected') {
                // rejected
                status = <span className="sprite sprite-abnormal" title={formatMessage({ id: "LANG2401" })} ></span>
            } else if (statusLower === 'timeout') {
                // timeout
                status = <span className="sprite sprite-abnormal" title={formatMessage({ id: "LANG102" })} ></span>
            } else if (statusLower.indexOf('no authentication') !== -1 || statusLower === 'no') {
                // no authentication
                status = <span className="sprite sprite-abnormal" title={formatMessage({ id: "LANG2428" })} ></span>
            } else if (statusLower.indexOf('auth. sent') !== -1 || statusLower.indexOf('request sent') !== -1 || statusLower === 'request') {
                // trying
                status = <span className="sprite sprite-abnormal" title={formatMessage({ id: "LANG2402" })} ></span>
            } else if (statusLower === 'errorconfigured') {
                // Error configured
                status = <span className="sprite sprite-abnormal" title={formatMessage({ id: "LANG2795" })} ></span>
            }
        }

        return status
    }
    _checkTextLen = (text) => {
        if (text.length > 8) {
            var subText = text.substring(0, 7)
            return (<font title={text}>{subText + "..."}</font>)
        }
        return (<font className="trunk-text">{text}</font>)
    }
    _renderTrunksNumber = (trunks, attr) => {
        return <font className="trunk-total">{trunks[attr]}</font>
    }
    render() {
        const {formatMessage} = this.props.intl
        let trunksData = this.props.trunksData

        if (!trunksData) {
            trunksData = {}
        }
        const columns = [
            {
                title: formatMessage({id: "LANG1351"}),
                dataIndex: 'trunk_name'
            }, {
                title: formatMessage({id: "LANG81"}),
                dataIndex: 'status',
                render: (text, record, index) => (
                    this._createStatus(text, record, index)
                )
            }
        ]

        const pagination = {
            total: trunksData.total_item,
            showSizeChanger: true,
            onShowSizeChange(current, pageSize) {
                console.log('Current: ', current, '; PageSize: ', pageSize)
            },
            onChange(current) {
                console.log('Current: ', current)
            }
        }

        // rowSelection object indicates the need for row selection
        const rowSelection = {
            onChange(selectedRowKeys, selectedRows) {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
            },
            onSelect(record, selected, selectedRows) {
                console.log(record, selected, selectedRows)
            },
            onSelectAll(selected, selectedRows, changeRows) {
                console.log(selected, selectedRows, changeRows)
            }
        }
        return (
            <div className="trunks">
                <Card title="Trunks" bordered={true} bodyStyle={{ padding: 0 }}>
                    <div className="trunks-total">
                        <Row gutter={10}>
                            <Col className="gutter-row" sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12 }}>
                                <Row gutter={10}>
                                    <Col className="gutter-row" sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12 }}>
                                        <div id="trunksPercent" style={{width: 52, height: 52}}></div>
                                    </Col>
                                    <Col className="gutter-row text-center" pull={2} sm={{ span: 12}} md={{ span: 9}} lg={{ span: 9}}>
                                        <div>
                                            {this._renderTrunksNumber(trunksData, "total_item")}
                                        </div>
                                        <font>Total</font>
                                    </Col>
                                    <Col xs={{ span: 24}} sm={{ span: 12}} md={{ span: 1}} lg={{ span: 1}}>
                                        <hr className="hr-vertical" />
                                    </Col>
                                </Row>
                            </Col>
                            <Col className="gutter-row trunks-status" sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12 }}>
                                <Row gutter={10}>
                                    <Col className="gutter-row" sm={{ span: 6}} md={{ span: 6}} lg={{ span: 12}}>
                                        <span title={formatMessage({id: "LANG110"})} className="sprite sprite-status-available"></span>
                                        <span title={formatMessage({id: "LANG110"})} className="ml15">{ this._renderTrunksNumber(trunksData, "available_trunk_number") }</span>
                                    </Col>
                                    <Col className="gutter-row" sm={{ span: 6}} md={{ span: 6}} lg={{ span: 12}}>
                                        <span title={formatMessage({id: "LANG2237"})} className="sprite sprite-status-busy"></span>
                                        <span title={formatMessage({id: "LANG2237"})} className="ml15">{ this._renderTrunksNumber(trunksData, "busy_trunk_number") }</span>
                                    </Col>
                                </Row>
                                <Row gutter={10}>
                                    <Col className="gutter-row" sm={{ span: 6}} md={{ span: 6}} lg={{ span: 12}}>
                                        <span title={formatMessage({id: "LANG5396"})} className="sprite sprite-status-abnormal"></span>
                                        <span title={formatMessage({id: "LANG5396"})} className="ml15">{ this._renderTrunksNumber(trunksData, "unavailable_trunk_number") }</span>
                                    </Col>
                                    <Col className="gutter-row" sm={{ span: 6}} md={{ span: 6}} lg={{ span: 12}}>
                                        <span title={formatMessage({id: "LANG2395"})} className="sprite sprite-status-unmonitored"></span>
                                        <span title={formatMessage({id: "LANG2395"})} className="ml15">{ this._renderTrunksNumber(trunksData, "unmonitored_trunk_number") }</span>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    <Table columns={columns} dataSource={trunksData.trunks} />
                </Card>
            </div>
        )
    }
}

Trunks.defaultProps = {
}

const mapStateToProps = (state) => ({
    trunksData: state.trunksData
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Trunks))

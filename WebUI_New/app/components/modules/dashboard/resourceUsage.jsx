'use strict'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Card, Row, Col} from 'antd'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib//component/legend'
import 'echarts/lib//component/grid'

import $ from 'jquery'
import api from "../../api/api"

class ResourceUsage extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
        this.props.getResourceUsage()
    }
    componentWillUnmount() {
    }
    _showChart = (resourceUsage) => {
        let resourceUsageChart = echarts.init(document.getElementById('resourceUsage'))
        if (resourceUsage) {
            let memoryUsageData = resourceUsage["memory-usage"],
                cpuUsageData = resourceUsage["cpu-usage"],
                timesData = ['0s', '10s', '20s', '30s', '40s', '50s', '60s']
            const option = {
                title: {
                },
                tooltip: {
                    trigger: 'axis'
                },
                color: ['#4875F0', '#FF4179'],
                legend: {
                    right: '0',
                    selectedMode: false,
                    data: [{
                        name: 'CPU Usage',
                        icon: 'roundRect',
                        textStyle: {
                            color: '#7D8A99',
                            fontSize: '10px'
                        }
                    }, {
                        name: 'Memory Usage',
                        icon: 'roundRect',
                        textStyle: {
                            color: '#7D8A99',
                            fontSize: '10px'
                        }
                    }]
                },
                toolbox: {
                    show: false,
                    feature: {
                        saveAsImage: {}
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        axisLabel: {
                            textStyle: {
                                color: "#7D8A99",
                                fontSize: "10px",
                                fontWeight: 400
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                width: 0
                            }
                        },
                        data: timesData
                    },
                yAxis: {
                    axisLabel: {
                        formatter: function (val) {
                            return val + '%'
                        },
                        textStyle: {
                            color: "#7D8A99",
                            fontSize: "10px",
                            fontWeight: 400
                        }
                    },
                    boundaryGap: false,
                    splitNumber: 5,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "#E2E8EF"
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            width: 0
                        }
                    }
                },
                series: [{
                        name: 'CPU Usage',
                        type: 'line',
                        lineStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0, color: '#548DFF'
                                }, {
                                    offset: 1, color: '#654CE5'
                                }], false),
                                width: 1.5
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#3B66E6'
                                }, {
                                    offset: 1,
                                    color: '#E8EDFB'
                                }]),
                                opacity: '0.5'
                            }
                        },
                        itemStyle: {
                            normal: {
                                opacity: 0.3
                            }
                        },
                        data: cpuUsageData
                    }, {
                        name: 'Memory Usage',
                        type: 'line',
                        lineStyle: {
                            normal: {
                                type: 'solid',
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0, color: '#FF827F'
                                }, {
                                    offset: 1, color: '#FF3377'
                                }], true),
                                opacity: '0.5'
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                  offset: 0, color: '#E3497F'
                                }, {
                                  offset: 1, color: '#FAEBF1'
                                }], true),
                                opacity: '0.5'
                            }
                        },
                        itemStyle: {
                            normal: {
                                opacity: 0.3
                            }
                        },
                        data: memoryUsageData
                    }]
            }
            // for (let i = timesData.length - 1; i >= 0; i--) {
            //     let timesDataIndex = timesData[i]
            //     timesData[i] = Number(timesDataIndex.match(/^\d+/)[0]) + 10 + "s"
            // }

            resourceUsageChart.setOption(option)
            resourceUsageChart.setOption({
                xAxis: {
                    data: timesData
                },
                series: [{
                    name: 'CPU Usage',
                    data: cpuUsageData
                }, {
                    name: 'Memory Usage',
                    data: memoryUsageData
                }]
            })
        }
    }
    _renderPercent = (resourceUsage, attr) => {
        if (resourceUsage) {
            if (attr === "cpu-percent" && resourceUsage["cpu-usage"]) {
                return <font className="usage-rate-percent">{resourceUsage["cpu-usage"][resourceUsage["cpu-usage"].length - 1] + "%"}</font>
            } else if (attr === "memory-percent" && resourceUsage["memory-usage"]) {
                return <font className="usage-rate-percent">{resourceUsage["memory-usage"][resourceUsage["memory-usage"].length - 1] + "%"}</font>
            } else if (attr === "memory-total") {
                return <font className="usage-rate-space">{resourceUsage["memory-total"]}</font>
            }
        }
    }
    render() {
        const me = this
        let resourceUsage = this.props.resourceUsage

        if (resourceUsage) {
            setTimeout(() => {
                me._showChart(resourceUsage)
            }, 200)
        }
        return (
            <div className="resource-usage">
                <Card title="Resource Usage" bordered={true}>
                    <Row gutter={10} align="middle">
                        <Col className="gutter-row" xs={{ span: 18}} sm={{ span: 18}} md={{ span: 18}} lg={{ span: 18}}>
                            <div id="resourceUsage" style={{height: 250}}></div>
                        </Col>
                        <Col className="gutter-row" xs={{ span: 6}} sm={{ span: 6}} md={{ span: 6}} lg={{ span: 6}}>
                            <Row gutter={10} align="middle">
                                <div className="usage-rate usage-rate-cpu">
                                    <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 24}} md={{ span: 24}} lg={{ span: 24}}>
                                        <div>
                                            <span>CPU Usage</span>
                                        </div>
                                        <div>
                                            {this._renderPercent(resourceUsage, "cpu-percent")}
                                            <span className="sprite sprite-resurce-up"></span>
                                        </div>
                                        {/* <div>
                                            <font className="usage-rate-space">{this.state["cpu-usage"]}</font>
                                            <font className="usage-rate-total">Total</font>
                                        </div> */}
                                    </Col>
                                </div>
                            </Row>
                            <hr className="hr" style={{ width: 100 }} />
                            <Row gutter={10} align="middle">
                                <div className="usage-rate">
                                    <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 24}} md={{ span: 24}} lg={{ span: 24}}>
                                        <div>
                                            <span>Memory Usage</span>
                                        </div>
                                        <div>
                                            {this._renderPercent(resourceUsage, "memory-percent")}
                                            <span className="sprite sprite-resurce-down"></span>
                                        </div>
                                        <div>
                                            {this._renderPercent(resourceUsage, "memory-total")}
                                            <font className="usage-rate-total">Total</font>
                                        </div>
                                    </Col>
                                </div>
                            </Row>
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

ResourceUsage.defaultProps = {
}

const mapStateToProps = (state) => ({
    resourceUsage: state.resourceUsage
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ResourceUsage))

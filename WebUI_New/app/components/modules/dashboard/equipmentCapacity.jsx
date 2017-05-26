import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Card, Row, Col } from 'antd'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib//component/legend'

class EquipmentCapacity extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
        this.props.getStorageUsage()
    }
    componentWillUnmount() {
    }
    _showChart = (cfgObj, dataObj) => {
        const {formatMessage} = this.props.intl

        let cfgPartitionMsg = formatMessage({id: "LANG161"}),
            dataPartitionMsg = formatMessage({id: "LANG162"})

        let cfgInodeData = [
            {value: cfgObj.inode.usage, name: formatMessage({id: "LANG5395"})},
            {value: cfgObj.inode.avail, name: formatMessage({id: "LANG116"})}
        ],
        cfgSpaceData = [
            {value: cfgObj.space.usage, name: formatMessage({id: "LANG5394"})},
            {value: cfgObj.space.avail, name: formatMessage({id: "LANG116"})}
        ]

        const cfgOption = {
            title: {
                text: cfgPartitionMsg,
                x: 'center',
                textStyle: {
                    color: '#4F5A70',
                    fontSize: '14px'
                }
            },
            tooltip: {
                trigger: 'item',
                position: "right",
                textStyle: {
                    fontSize: "10"
                },
                formatter: "{a} <br/>{b}: {c}MB ({d}%)"
            },
            color: ['#0DC3E1', '#F3F5F7', '#5056C6'],
            legend: {
                orient: 'vertical',
                bottom: '0',
                left: "12",
                data: [{
                    name: formatMessage({id: "LANG5394"}),
                    icon: 'circle'
                }, {
                    name: formatMessage({id: "LANG5395"}),
                    icon: 'circle'
                }],
                selectedMode: false,
                formatter: '{name}'
            },
            series: [{
                name: "inode",
                type: 'pie',
                selectedMode: 'single',
                radius: ['30%', '40%'],
                label: {
                    normal: {
                        show: false
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                itemStyle: {
                },
                hoverAnimation: false,
                data: cfgInodeData
            }, {
                name: cfgPartitionMsg,
                type: 'pie',
                radius: ['45%', '55%'],
                label: {
                    normal: {
                        show: false
                    }
                },
                hoverAnimation: false,
                data: cfgSpaceData
            }]
        }
        let cfgPartition = echarts.init(document.getElementById('cfgPartition'))
        cfgPartition.setOption(cfgOption)

        let dataInodeData = [
            {value: dataObj.inode.usage, name: formatMessage({id: "LANG5395"})},
            {value: dataObj.inode.avail, name: formatMessage({id: "LANG116"})}
        ],
        dataSpaceData = [
            {value: dataObj.space.usage, name: formatMessage({id: "LANG5394"})},
            {value: dataObj.space.avail, name: formatMessage({id: "LANG116"})}
        ]
        const dataOption = {
            title: {
                text: dataPartitionMsg,
                x: 'center',
                textStyle: {
                    color: '#4F5A70',
                    fontSize: '14px'
                }
            },
            tooltip: {
                trigger: 'item',
                position: "left",
                textStyle: {
                    fontSize: "10"
                },
                formatter: "{a} <br/>{b}: {c}MB ({d}%)"
            },
            color: ['#0DC3E1', '#F3F5F7', '#5056C6'],
            legend: {
                orient: 'vertical',
                bottom: '0',
                left: "12",
                data: [{
                    name: formatMessage({id: "LANG5394"}),
                    icon: 'circle'
                }, {
                    name: formatMessage({id: "LANG5395"}),
                    icon: 'circle'
                }],
                selectedMode: false,
                formatter: '{name}'
            },
            series: [{
                name: "inode",
                type: 'pie',
                selectedMode: 'single',
                radius: ['30%', '40%'],
                label: {
                    normal: {
                        show: false
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                itemStyle: {
                },
                hoverAnimation: false,
                data: dataInodeData
            }, {
                name: dataPartitionMsg,
                type: 'pie',
                radius: ['45%', '55%'],
                label: {
                    normal: {
                        show: false
                    }
                },
                hoverAnimation: false,
                data: dataSpaceData
            }]
        }

        let dataPartition = echarts.init(document.getElementById('dataPartition'))
        dataPartition.setOption(dataOption)
    }
    render() {
        const {formatMessage} = this.props.intl
        const me = this
        let storageUsage = this.props.storageUsage
        let cfgPartition = storageUsage.cfgPartition,
            dataPartition = storageUsage.dataPartition

        if (cfgPartition && dataPartition) {
            setTimeout(function() {
                me._showChart(cfgPartition, dataPartition)
            }, 200)
        } else {
            cfgPartition = {
                space: {
                    usage: 0,
                    total: 0
                },
                inode: {
                    usage: 0,
                    total: 0
                }
            }
            dataPartition = {
                space: {
                    usage: 0,
                    total: 0
                },
                inode: {
                    usage: 0,
                    total: 0
                }
            }
        }

        return (
            <Card title="Equipment Capacity" bordered={true}>
                <Row align="middle">
                    <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                        <div id="cfgPartition" style={{height: 250}}></div>
                        <div className="space-usage">
                            <span className="space-used">{cfgPartition.space.usage + "MB"}</span>
                            <span>/</span>
                            <span className="space-total">{cfgPartition.space.total + "MB"}</span>
                        </div>
                        <div className="inode-usage">
                            <span className="space-used">{cfgPartition.inode.usage}</span>
                            <span>/</span>
                            <span className="space-total">{cfgPartition.inode.total}</span>
                        </div>
                    </Col>
                    <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                        <div id="dataPartition" style={{height: 250}}></div>
                        <div className="space-usage">
                            <span className="space-used">{dataPartition.space.usage + "MB"}</span>
                            <span>/</span>
                            <span className="space-total">{dataPartition.space.total + "MB"}</span>
                        </div>
                        <div className="inode-usage">
                            <span className="space-used">{dataPartition.inode.usage}</span>
                            <span>/</span>
                            <span className="space-total">{dataPartition.inode.total}</span>
                        </div>
                    </Col>
                </Row>
            </Card>
        )
    }
}

EquipmentCapacity.propTypes = {
    getStorageUsage: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
    storageUsage: state.storageUsage
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EquipmentCapacity))

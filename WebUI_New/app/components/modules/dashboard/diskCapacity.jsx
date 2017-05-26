'use strict'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Card, Row, Col, Progress } from 'antd'

class DiskCapacity extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
        // this.props.getStorageUsage()
    }
    // componentDidUpdate() {
    //     alert("fdsfdsf")
    // }
    render() {
        let storageUsage = this.props.storageUsage
        let usbPartition = storageUsage.usbPartition,
            sdPartition = storageUsage.sdPartition

        if (!usbPartition) {
            usbPartition = {
                space: {
                    usage: 0,
                    total: 0
                }
            }
        }
        if (!sdPartition) {
            sdPartition = {
                space: {
                    usage: 0,
                    total: 0
                }
            }
        }
        
        return (
            <div className="disk-capacity">
                <div className="disk-capacity-usb">
                    <Card title="Disk Capacity" bordered={true}>
                        <Row gutter={10} align="middle">
                            <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                                <span className="equipment-name">USB</span>
                            </Col>
                        </Row>
                        <div className={(usbPartition.space.usage === 0 && usbPartition.space.total === 0) ? "text-center display-block" : "hidden"}>
                            <Row gutter={10} align="middle">
                                <span className="sprite sprite-no-usb"></span>
                            </Row>
                        </div>
                        <div className={(usbPartition.space.usage === 0 && usbPartition.space.total === 0) ? "hidden" : "display-block"}>
                            <Row gutter={10} align="middle" className="equipment-usage-rate">
                                <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                                    <span className="equipment-usage">Usage</span>
                                </Col>
                                <Col className="gutter-row equipment-rate" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                                    <span className="equipment-rate-usb-used">{usbPartition.space.usage + "MB"}</span>
                                    <span>/</span>
                                    <span className="equipment-rate-total">{usbPartition.space.total + "MB"}</span>
                                </Col>
                            </Row>
                            <Row gutter={10} align="middle">
                                <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 24}}>
                                    <div className="usb-progress">
                                        <Progress percent={(usbPartition.space.usage / usbPartition.space.total) * 100} showInfo={false} className="usb-progress" />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </div>
                <Card bordered={true}>
                    <Row gutter={10} align="middle">
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span className="equipment-name">SD Card</span>
                        </Col>
                    </Row>
                    <div className={(sdPartition.space.usage === 0 && sdPartition.space.total === 0) ? "text-center display-block" : "hidden"}>
                        <Row gutter={10} align="middle">
                            <span className="sprite sprite-no-sd"></span>
                        </Row>
                    </div>
                    <div className={(sdPartition.space.usage === 0 && sdPartition.space.total === 0) ? "hidden" : "display-block"}>
                        <Row gutter={10} align="middle" className="equipment-usage-rate">
                            <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                                <span className="equipment-usage">Usage</span>
                            </Col>
                            <Col className="gutter-row equipment-rate" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                                <span className="equipment-rate-sd-used">{sdPartition.space.usage + "MB"}</span>
                                <span>/</span>
                                <span className="equipment-rate-total">{sdPartition.space.total + "MB"}</span>
                            </Col>
                        </Row>
                        <Row gutter={10} align="middle">
                            <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 24}}>
                                <div className="sd-progress">
                                    <Progress percent={(sdPartition.space.usage / sdPartition.space.total) * 100} showInfo={false} />
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card>
            </div>
        )
    }
}

DiskCapacity.propTypes = {
    getStorageUsage: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
    storageUsage: state.storageUsage
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DiskCapacity))

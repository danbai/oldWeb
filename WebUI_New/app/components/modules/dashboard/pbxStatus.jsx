import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Table, Card, Row, Col, Progress } from 'antd'
import _ from 'underscore'

class PBXStatus extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    componentDidMount() {
        this.props.getPbxStatus()
    }
    componentWillUnmount() {
    }
    _renderContent = (pbxStatus, attr) => {
        const {formatMessage} = this.props.intl

        if (!_.isEmpty(pbxStatus)) {
            if (attr === "auto_clean" || attr === "auto_sync" ||
                attr === "dynamic_defense" || attr === "fail2ban" ||
                attr === "regular_backup") {
                let className = "sprite sprite-turn-off",
                    text = formatMessage({id: "LANG5399"})

                if (pbxStatus[attr] && pbxStatus[attr].toLowerCase() !== "no") {
                    className = "sprite sprite-turn-on"
                    text = formatMessage({id: "LANG5398"})
                }

                return (<div>
                            <span title={text} className={className}></span>
                            <span>{text}</span>
                        </div>)
            }
            if (attr === "parking_count" || attr === "meetroom_count" ||
                attr === "extension_count" || attr === "queue_count") {
                let inUse = 0,
                    total = 0,
                    percent = 0

                if (attr === "parking_count") {
                    inUse = pbxStatus.parking_inuse
                    total = pbxStatus.parking_count
                }
                if (attr === "meetroom_count") {
                    inUse = pbxStatus.meetroom_inuse
                    total = pbxStatus.meetroom_count
                }
                if (attr === "extension_count") {
                    inUse = pbxStatus.extension_register
                    total = pbxStatus.extension_count
                }
                if (attr === "queue_count") {
                    inUse = pbxStatus.queue_inuse
                    total = pbxStatus.queue_count
                }
                percent = (Number(inUse) / Number(total)) * 100
                if (isNaN(percent)) {
                    percent = 0
                }
                return (<div>
                            <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                                <span>
                                    <Progress percent={percent} showInfo={false} />
                                </span>
                            </Col>
                            <Col className="gutter-row" push={5} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                                <font>{inUse}</font>
                                <font>/</font>
                                <font>{total}</font>
                            </Col>
                        </div>)
            }
            return <span>{pbxStatus[attr]}</span>
        } else {
            return <span>{formatMessage({id: "LANG909"})}</span>
        }
    }
    render() {
        const {formatMessage} = this.props.intl
        let pbxStatus = this.props.pbxStatus

        let gutter = 20,
            push = 0

        return (
            <div className="pbx-status">
                <Card title="PBX Status" bordered={true}>
                    <Row gutter={gutter} align="middle">
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG5397"})}</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderContent(pbxStatus, "date")}
                        </Col>
                    </Row>
                    <Row gutter={gutter}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG3006"})}</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderContent(pbxStatus, "calls_num")}
                        </Col>
                    </Row>
                    <Row gutter={gutter}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>Extensions</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <div className="progress">
                                <Row>
                                    {this._renderContent(pbxStatus, "extension_count")}
                                </Row>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={gutter}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG98"})}</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <div className="progress">
                                <Row>
                                    {this._renderContent(pbxStatus, "meetroom_count")}
                                </Row>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={gutter}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG607"})}</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <div className="progress">
                                <Row>
                                    {this._renderContent(pbxStatus, "queue_count")}
                                </Row>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={gutter}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG1242"})}</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <div className="progress">
                                <Row>
                                    {this._renderContent(pbxStatus, "parking_count")}
                                </Row>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={gutter}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG2303"})}</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderContent(pbxStatus, "dynamic_defense")}
                        </Col>
                    </Row>
                    <Row gutter={gutter}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG2600"})}</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderContent(pbxStatus, "fail2ban")}
                        </Col>
                    </Row>
                    <Row gutter={gutter}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG5402"})}</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderContent(pbxStatus, "regular_backup")}
                        </Col>
                    </Row>
                    <Row gutter={gutter}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG5400"})}</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderContent(pbxStatus, "auto_sync")}
                        </Col>
                    </Row>
                    <Row gutter={gutter}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG5401"})}</span>
                        </Col>
                        <Col className="gutter-row" push={push} xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderContent(pbxStatus, "auto_clean")}
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

PBXStatus.defaultProps = {
}

const mapStateToProps = (state) => ({
    pbxStatus: state.pbxStatus
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PBXStatus))

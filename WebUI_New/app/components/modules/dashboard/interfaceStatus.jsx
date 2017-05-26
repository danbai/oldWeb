import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Table, Card, Row, Col } from 'antd'
import _ from 'underscore'

class InterfaceStatus extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
        this.props.getInterfaceStatus()
    }
    componentWillUnmount() {
    }
    _renderTitleClsName = (interfaceStatus, attr) => {
        const {formatMessage} = this.props.intl
        let titleTxt = "",
            classNameTxt = ""

        if (attr === "interface-usbdisk") {
            if (interfaceStatus['interface-usbdisk'] === "true") {
                titleTxt = formatMessage({id: "LANG999"})
                classNameTxt = "sprite sprite-usbdisk-connected"
            } else {
                titleTxt = formatMessage({id: "LANG1000"})
                classNameTxt = "sprite sprite-usbdisk-disconnected"
            }
        }
        if (attr === "interface-sddisk") {
            if (interfaceStatus['interface-sdcard'] === "true") {
                titleTxt = formatMessage({id: "LANG997"})
                classNameTxt = "sprite sprite-sdcard-connected"
            } else {
                titleTxt = formatMessage({id: "LANG998"})
                classNameTxt = "sprite sprite-sdcard-disconnected"
            }
        }
        if (attr === "power-poe") {
            if (typeof (interfaceStatus['power-poe']) !== "undefined") {
                if (interfaceStatus['power-poe'] === 1) {
                    titleTxt = formatMessage({id: "LANG3075"})
                    classNameTxt = "sprite sprite-power-connected"
                } else {
                    titleTxt = formatMessage({id: "LANG3076"})
                    classNameTxt = "sprite sprite-power-disconnected"
                }
            }
        }
        if (attr === "power-port1" || attr === "power-port2") {
            if (typeof (interfaceStatus[attr]) !== "undefined") {
                if (interfaceStatus[attr] === "Work") {
                    titleTxt = formatMessage({id: "LANG3079"})
                    classNameTxt = "sprite sprite-power-connected"
                } else if (interfaceStatus[attr] === "Disconnected") {
                    if (attr === "power-port1") {
                        titleTxt = formatMessage({id: "LANG3077"}) + formatMessage({id: "LANG3080"})
                    } else {
                        titleTxt = formatMessage({id: "LANG3078"}) + formatMessage({id: "LANG3080"})
                    }
                    classNameTxt = "sprite sprite-power-disconnected"
                } else {
                    titleTxt = formatMessage({id: "LANG3081"})
                    classNameTxt = "sprite sprite-power-abnormal"
                }
            }
        }
        if (attr === "HBT" || attr === "WAN" || attr === "LAN") {
            let interfaceNetwork = interfaceStatus['interface-network']
            if (!_.isEmpty(interfaceNetwork)) {
                if (typeof (interfaceNetwork[attr]) !== "undefined") {
                    if (attr === "HBT" && interfaceNetwork.HBT) {
                        if (interfaceNetwork.HBT === "linked") {
                            titleTxt = formatMessage({id: "LANG3072"})
                            classNameTxt = "sprite sprite-net-connected"
                        } else {
                            titleTxt = formatMessage({id: "LANG3073"})
                            classNameTxt = "sprite sprite-net-disconnected"
                        }
                    }
                    if (attr === "WAN" && interfaceNetwork.WAN) {
                        if (interfaceNetwork.WAN === "linked") {
                            titleTxt = formatMessage({id: "LANG1001"})
                            classNameTxt = "sprite sprite-net-connected"
                        } else {
                            titleTxt = formatMessage({id: "LANG1002"})
                            classNameTxt = "sprite sprite-net-disconnected"
                        }
                    }
                    if ((attr === "LAN" && interfaceNetwork.LAN) || (attr === "LAN1" && interfaceNetwork.LAN1) || (attr === "LAN2" && interfaceNetwork.LAN2)) {
                        if (interfaceNetwork.LAN === "linked") {
                            titleTxt = formatMessage({id: "LANG1003"})
                            classNameTxt = "sprite sprite-net-connected"
                        } else {
                            titleTxt = formatMessage({id: "LANG1004"})
                            classNameTxt = "sprite sprite-net-disconnected"
                        }
                    }
                }
            }
        }
        if (attr === "digital1" || attr === "digital2") {
            if (typeof (interfaceStatus['interface-pri']) !== "undefined") {
                let DAHDI_ALARM_NONE = 0, /* No alarms */
                    DAHDI_ALARM_RECOVER = (1 << 0), /* Recovering from alarm */
                    DAHDI_ALARM_LOOPBACK = (1 << 1), /* In loopback */
                    DAHDI_ALARM_YELLOW = (1 << 2), /* Yellow Alarm */
                    DAHDI_ALARM_RED = (1 << 3), /* Red Alarm */
                    DAHDI_ALARM_BLUE = (1 << 4), /* Blue Alarm */
                    DAHDI_ALARM_NOTOPEN = (1 << 5),
                /* Verbose alarm states (upper byte) */
                    DAHDI_ALARM_LOS = (1 << 8), /* Loss of Signal */
                    DAHDI_ALARM_LFA = (1 << 9), /* Loss of Frame Alignment */
                    DAHDI_ALARM_LMFA = (1 << 10) /* Loss of Multi-Frame Align */

                for (let i = 0; i < interfaceStatus['interface-pri'].length; i++) {
                    if ((interfaceStatus['interface-pri'][i].alarm | DAHDI_ALARM_NONE) === 0) {
                        titleTxt = `${formatMessage({id: "LANG3094"})} ${i + 1} ${formatMessage({id: "LANG3084"})}`
                        classNameTxt = "sprite sprite-net-connected"
                    } else if ((interfaceStatus['interface-pri'][i].alarm & DAHDI_ALARM_YELLOW) !== 0) {
                        titleTxt = `${formatMessage({id: "LANG3094"})} ${i + 1} ${formatMessage({id: "LANG2547"})}`
                        // classNameTxt = "sprite sprite-net-yellow"
                        classNameTxt = "sprite sprite-net-disconnected"
                    } else if ((interfaceStatus['interface-pri'][i].alarm & DAHDI_ALARM_RED) !== 0) {
                        titleTxt = `${formatMessage({id: "LANG3094"})} ${i + 1} ${formatMessage({id: "LANG2547"})}`
                        // classNameTxt = "sprite sprite-net-red"
                        classNameTxt = "sprite sprite-net-disconnected"
                    } else if ((interfaceStatus['interface-pri'][i].alarm & DAHDI_ALARM_BLUE) !== 0) {
                        titleTxt = `${formatMessage({id: "LANG3094"})} ${i + 1} ${formatMessage({id: "LANG2547"})}`
                        // classNameTxt = "sprite sprite-net-blue"
                        classNameTxt = "sprite sprite-net-disconnected"
                    } else if ((interfaceStatus['interface-pri'][i].alarm & DAHDI_ALARM_NOTOPEN) !== 0) {
                        titleTxt = `${formatMessage({id: "LANG3094"})} ${i + 1} ${formatMessage({id: "LANG2547"})}`
                        // classNameTxt = "sprite sprite-net_connected_but_cant_use"
                        classNameTxt = "sprite sprite-net-disconnected"
                    }
                }
            }
        }
        return (<div className="FXO-FXS"><span title={titleTxt} className={classNameTxt}></span></div>)
    }
    _getPortsStatus = (status, type, reversal, disabled) => {
        const {formatMessage} = this.props.intl

        let obj = {},
            sprite = "sprite "

        status = status.toLowerCase()

        // Disconnect and UnConfigured, UnConfigured, Disconnect, Idle, InUse

        if (type === "fxo") {
            if (status === "disconnect" || status === "disconnect and unconfigured") {
                // Disconnected
                obj["clsName"] = "sprite sprite-FXO-FXS-disabled"
                obj["title"] = formatMessage({id: "LANG996"})
            } else if (status === "unconfigured") {
                // Connected but unconfigure
                obj["clsName"] = "sprite sprite-FXO-FXS-disabled"
                obj["title"] = formatMessage({id: "LANG1005"})
            } else if (status === "idle") {
                // Connected and Idle
                obj["clsName"] = "sprite sprite-FXO-FXS-available"
                obj["title"] = formatMessage({id: "LANG1006"})
            } else if (status === "inuse") {
                // Connected and in-used
                obj["clsName"] = "sprite sprite-FXO-FXS-inUse"
                obj["title"] = formatMessage({id: "LANG112"})
            }
        } else if (type === "fxs") {
            // Idle, InUse, UnConfigured
            if (status === "unconfigured" || status === "disconnect and unconfigured") {
                // Connected but unconfigure
                obj["clsName"] = "sprite sprite-FXO-FXS-disabled"
                obj["title"] = formatMessage({id: "LANG1008"})
            } else if (status === "idle") {
                // Connected and Idle
                obj["clsName"] = "sprite sprite-FXO-FXS-available"
                obj["title"] = formatMessage({id: "LANG1006"})
            } else if (status === "inuse") {
                // Connected and in-used
                obj["clsName"] = "sprite sprite-FXO-FXS-inUse"
                obj["title"] = formatMessage({id: "LANG112"})
            }
            // Check if this extension is disabled or not.
            if (disabled && (disabled === "yes")) {
                obj["clsName"] = "sprite sprite-FXO-FXS-disabled"
                obj["title"] = formatMessage({id: "LANG273"})
            }
        }

        return obj
    }
    _parseAndAddedPorts = (data, type, res) => {
        const modelInfo = JSON.parse(localStorage.getItem('model_info'))
        let fxo_total = Number(modelInfo.num_fxo),
            fxs_total = Number(modelInfo.num_fxs),
            total = (fxo_total + fxs_total),
            arr = []

        if (total <= 6) {
            // GXE5120, 5121
            if (type === "fxo") {
                for (let i = 0; i < fxo_total; i++) {
                    let chan = data[i].chan,
                        status = data[i].status,
                        statusObj = this._getPortsStatus(status, "fxo", ""),
                        obj = {}

                        obj["title"] = statusObj.title
                        obj["clsName"] = statusObj.clsName
                        obj["chan"] = chan
                        arr.push(obj)
                }
            } else if (type === "fxs") {
                for (let i = 0; i < data.length; i++) {
                    let chan = data[i].chan,
                        status = data[i].status,
                        disabled = data[i].out_of_service, // Check if this extension is disabled or not.
                        statusObj = this._getPortsStatus(status, "fxs", "", disabled),
                        obj = {}

                        obj["title"] = statusObj.title
                        obj["clsName"] = statusObj.clsName
                        obj["chan"] = chan
                        arr.push(obj)
                }
            }
        } else {
            // Others
            if (type === "fxo") {
                for (let i = 0; i < fxo_total; i++) {
                    let chan = data[i].chan,
                        status = data[i].status,
                        statusObj = {},
                        obj = {}

                    if (chan % 2 !== 0) {
                        statusObj = this._getPortsStatus(status, "fxo", "")
                    }
                    if (chan % 2 === 0) {
                        statusObj = this._getPortsStatus(status, "fxo", "_r")
                    }
                    obj["title"] = statusObj.title
                    obj["clsName"] = statusObj.clsName
                    obj["chan"] = chan
                    arr.push(obj)
                }

                // for (let i = 0; i < fxo_total; i++) {
                //     let chan = data[i].chan,
                //         obj = {},
                //         status = data[i].status

                //     if (chan % 2 === 0) {
                //         let statusObj = this._getPortsStatus(status, "fxo", "_r")

                //         obj["title"] = statusObj.title
                //         obj["clsName"] = statusObj.clsName
                //         obj["chan"] = chan
                //         arr.push(obj)
                //     }
                // }
            } else if (type === "fxs") {
                for (let i = 0; i < data.length; i++) {
                    let chan = data[i].chan,
                        obj = {},
                        status = data[i].status,
                        disabled = data[i].out_of_service, // Check if this extension is disabled or not.
                        statusObj = this._getPortsStatus(status, "fxs", "", disabled)

                        obj["title"] = statusObj.title
                        obj["clsName"] = statusObj.clsName
                        obj["chan"] = chan
                        arr.push(obj)
                }
            }
        }

        let str = ""

        for (let i = 0; i <= arr.length - 1; i++) {
            str += "<span title='" + arr[i].title + "' class='" + arr[i].clsName + "'>" +
                   "<font class='downindex'>" + arr[i].chan + "</font>" +
                   "</span>"
        }

        return (<div className="FXO-FXS" dangerouslySetInnerHTML={{__html: str}} ></div>)
    }
    _renderFXSFXO = (interfaceStatus, attr) => {
        if (attr === "interface-fxs") {
            if (interfaceStatus['interface-fxs'] && interfaceStatus['interface-fxs'].length !== 0) {
                return this._parseAndAddedPorts(interfaceStatus['interface-fxs'], "fxs", interfaceStatus)
            }
        }
        if (attr === "interface-fxo") {
            if (interfaceStatus['interface-fxo'] && interfaceStatus['interface-fxo'].length !== 0) {
                return this._parseAndAddedPorts(interfaceStatus['interface-fxo'], "fxo", interfaceStatus)
            }
        }
    }
    _isDisplay = (interfaceStatus, attr) => {
        let clsName = "display-block"
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        let numPri = Number(model_info.num_pri)

        if (attr === "HBT" || attr === "WAN" || attr === "LAN" || attr === "LAN1" || attr === "LAN2") {
            if (!_.isEmpty(interfaceStatus['interface-network'])) {
                if (typeof (interfaceStatus['interface-network'][attr]) === "undefined") {
                    clsName = "hidden"
                }
            } else {
                clsName = "hidden"
            }
        } else if (typeof (interfaceStatus['interface-pri']) !== "undefined" && (numPri >= 1 && (attr === "digital1" || attr === "digital2"))) {
           for (let i = 0; i < interfaceStatus['interface-pri'].length; i++) {
                if ((interfaceStatus['interface-pri'][i].span - 2) === 1 && attr === "digital1") {
                    /* Show Port 1 */
                    clsName = "display-block"
                } else if (attr === "digital2" && (interfaceStatus['interface-pri'][i].span - 2) !== 1) {
                    /* Show Port 2 */
                    clsName = "display-block"
                } else {
                    clsName = "hidden"
                }
            }
        } else if (typeof (interfaceStatus['interface-fxs']) !== "undefined" && attr === "interface-fxs") {
            if (interfaceStatus['interface-fxs'].length === 0) {
                clsName = "hidden"
            }
        } else if (typeof (interfaceStatus['interface-fxo']) !== "undefined" && attr === "interface-fxo") {
            if (interfaceStatus['interface-fxo'].length === 0) {
                clsName = "hidden"
            }
        } else {
            if (typeof (interfaceStatus[attr]) === "undefined") {
                clsName = "hidden"
            }
        }
        return "interface-status-row " + clsName
    }
    render() {
        const {formatMessage} = this.props.intl
        let interfaceStatus = this.props.interfaceStatus

        let gutter = 20

        return (
            <div className="interface-status">
                <Card title="Interface Status" bordered={true}>
                    <Row gutter={gutter} align="middle" className="interface-status-row">
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>USB</span>
                        </Col>
                        <Col className="gutter-row power-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "interface-usbdisk")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} className="interface-status-row">
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG262"})}</span>
                        </Col>
                        <Col className="gutter-row power-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "interface-sddisk")}
                        </Col>
                    </Row>
                     <Row gutter={gutter} align="middle" className={this._isDisplay(interfaceStatus, "LAN")}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG265"})}</span>
                        </Col>
                        <Col className="gutter-row net-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "LAN")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} align="middle" className={this._isDisplay(interfaceStatus, "LAN1")}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>LAN1</span>
                        </Col>
                        <Col className="gutter-row net-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "LAN1")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} align="middle" className={this._isDisplay(interfaceStatus, "LAN2")}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>LAN2</span>
                        </Col>
                        <Col className="gutter-row net-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "LAN2")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} className={this._isDisplay(interfaceStatus, "WAN")}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG264"})}</span>
                        </Col>
                        <Col className="gutter-row net-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "WAN")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} align="middle" className={this._isDisplay(interfaceStatus, "power-poe")}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG3074"})}</span>
                        </Col>
                        <Col className="gutter-row power-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "power-poe")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} className={this._isDisplay(interfaceStatus, "HBT")}>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG3071"})}</span>
                        </Col>
                        <Col className="gutter-row net-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "HBT")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} align="middle" className={ this._isDisplay(interfaceStatus, "power-port1") }>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG3077"})}</span>
                        </Col>
                        <Col className="gutter-row power-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "power-port1")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} className={ this._isDisplay(interfaceStatus, "power-port2") }>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG3078"})}</span>
                        </Col>
                        <Col className="gutter-row power-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "power-port2")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} align="middle" className={ this._isDisplay(interfaceStatus, "digital1") }>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG3082"})}</span>
                        </Col>
                        <Col className="gutter-row net-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "digital1")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} align="middle" className={ this._isDisplay(interfaceStatus, "digital2") }>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            <span>{formatMessage({id: "LANG3083"})}</span>
                        </Col>
                        <Col className="gutter-row net-right" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 12}} lg={{ span: 12}}>
                            {this._renderTitleClsName(interfaceStatus, "digital2")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} className={ this._isDisplay(interfaceStatus, "interface-fxs") }>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 6}} md={{ span: 6}} lg={{ span: 6}}>
                            <span>FXS</span>
                        </Col>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 18}} md={{ span: 18}} lg={{ span: 18}}>
                            {this._renderFXSFXO(interfaceStatus, "interface-fxs")}
                        </Col>
                    </Row>
                    <Row gutter={gutter} className={ this._isDisplay(interfaceStatus, "interface-fxo") }>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 6}} md={{ span: 6}} lg={{ span: 6}}>
                            <span>FXO</span>
                        </Col>
                        <Col className="gutter-row" xs={{ span: 24}} sm={{ span: 18}} md={{ span: 18}} lg={{ span: 18}}>
                            {this._renderFXSFXO(interfaceStatus, "interface-fxo")}
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

InterfaceStatus.defaultProps = {
}

const mapStateToProps = (state) => ({
    interfaceStatus: state.interfaceStatus
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(InterfaceStatus))

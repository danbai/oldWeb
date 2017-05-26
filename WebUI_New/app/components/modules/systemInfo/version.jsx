'use strict'

import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { bindActionCreators } from 'redux'
import React, { Component, PropTypes } from 'react'
import { Form, Input, Row, Col, Icon, message } from 'antd'
import * as Actions from './actions/getNetworkInformation'

const FormItem = Form.Item

class Version extends Component {
    constructor(props) {
        super(props)

        this.state = {}
    }
    convertToTime(second) {
        const {formatMessage} = this.props.intl

        let days,
            vtime = ""

        if (!isNaN(second)) {
            // return (new Date).clearTime().addSeconds(second).toString('HH:mm:ss');
            var time = ''

            if (second >= 24 * 3600) {
                days = parseInt(second / (24 * 3600))
                time += days + formatMessage({id: "LANG2392"}) + " "
                second %= (24 * 3600)
            }

            if (second >= 3600) {
                var tmp = parseInt(second / 3600)

                time += (((tmp < 10) ? "0" + tmp : tmp) + ":")
                vtime += (((tmp < 10) ? "0" + tmp : tmp) + ":")
                second %= 3600
            } else {
                time += "00:"
                vtime += "00:"
            }

            if (second >= 60) {
                let tmp = parseInt(second / 60)

                time += (((tmp < 10) ? "0" + tmp : tmp) + ":")
                vtime += (((tmp < 10) ? "0" + tmp : tmp) + ":")
                second %= 60
            } else {
                time += "00:"
                vtime += "00:"
            }

            if (second > 0) {
                let tmp = parseInt(second)

                time += (tmp < 10) ? "0" + tmp : tmp
                vtime += (tmp < 10) ? "0" + tmp : tmp
            } else {
                time += "00"
                vtime += "00"
            }

            if (days) {
                return formatMessage({id: "LANG2406"}, { 0: days, 1: vtime })
            } else {
                return vtime
            }
        } else {
            return second
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {

    }
    render() {
        const {formatMessage} = this.props.intl

        const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 14 }
            }

        let systemGeneralStatus = this.props.systemGeneralStatus
        let systemStatus = this.props.systemStatus

        if (systemGeneralStatus === undefined) {
            systemGeneralStatus = {}
        }

        if (systemStatus === undefined) {
            systemStatus = {}
        }

        const model_info = JSON.parse(localStorage.getItem('model_info'))

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG586"})})
        
        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <Form layout="horizontal">
                        <div className="section-title">{ formatMessage({id: "LANG586"}) }</div>
                        <Row className="row-section-content">
                            <FormItem
                                { ...formItemLayout }
                                label = { formatMessage({id: "LANG144"}) }
                            >
                                <span ref="product-model">
                                    { systemGeneralStatus["product-model"] }
                                </span>
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG145"}) }
                            >
                                <span ref="part-number">
                                    { systemStatus["part-number"] }
                                </span>
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG146"}) }
                            >
                                <span ref="system-time">
                                    { systemStatus["system-time"] }
                                </span>
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG147"}) }
                            >
                                <span ref="up-time">
                                    { this.convertToTime(systemStatus["up-time"]) }
                                </span>
                            </FormItem>
                            <div style={{ display: "none" }}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG148"}) }
                                >
                                    <span ref="idle-time">
                                        { this.convertToTime(systemStatus["idle-time"]) }
                                    </span>
                                </FormItem>
                            </div>
                        </Row>
                        <div className="section-title">{ formatMessage({id: "LANG588"}) }</div>
                        <Row className="row-section-content">
                            <FormItem
                                { ...formItemLayout}
                                label={ formatMessage({id: "LANG149"}) }
                            >
                                <span ref="boot-version">
                                    { systemGeneralStatus["boot-version"] }
                                </span>
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG150"}) }
                            >
                                <span ref="core-version">
                                    { systemGeneralStatus["core-version"] }
                                </span>
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG151"}) }
                            >
                                <span ref="base-version">
                                    { systemGeneralStatus["base-version"] }
                                </span>
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG4482"}) }
                            >
                                <span ref="lang-version">
                                   { systemGeneralStatus["lang-version"] } 
                                </span>
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG152"}) }
                            >
                                <span ref="prog-version">
                                    { systemGeneralStatus["prog-version"] }
                                </span>
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG153"}) }
                            >
                                <span ref="rcvr-version">
                                    { systemGeneralStatus["rcvr-version"] }
                                </span>
                            </FormItem>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

Version.defaultProps = {
    systemGeneralStatus: PropTypes.object.isRequired,
    systemStatus: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
   systemGeneralStatus: state.systemGeneralStatus,
   systemStatus: state.systemStatus
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(Version)))
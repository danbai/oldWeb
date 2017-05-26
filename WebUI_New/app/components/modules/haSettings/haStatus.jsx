'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { message, Form, Checkbox, Select, Spin, Tooltip, Input, Row, Col, Button, Modal } from 'antd'
import {injectIntl, FormattedHTMLMessage, formatMessage} from 'react-intl'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'

const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost

class HaStatus extends Component {
    constructor(props) {
        super(props)

        this.state = {
            status: {},
            rearrangeLog: "",
            backupLog: "",
            logtype: ""
        }
    }
    componentDidMount() {
        
    }
    componentWillUnmount() {

    }
    componentWillMount() {
        const { formatMessage } = this.props.intl
        let status = this.state.status

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getHaStatus'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    status = response || {}
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this._readLog("rearrange")
        this._readLog("backup")

        this.setState({
            status: status
        })
    }
    _readLog = (logtype) => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        let filename = logtype === "rearrange" ? "ha_rearrange_results" : "ha_backup_results"
        $.ajax({
            type: "GET",
            url: api.serverRoot + "/html/userdefined/" + filename + "?_=" + Math.random().toString(),
            dataType: "text",
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status !== 404) {
                    message.error(formatMessage({ id: "LANG909"}))
                }
            },
            success: function(data) {
                let arr = data.split("\n").reverse()
                if (arr.length > 1 && arr[1] === "</html>") {
                    arr = []
                }
                if (logtype === "rearrange") {
                    this.setState({
                        rearrangeLog: arr
                    })
                } else if (logtype === "backup") {
                    this.setState({
                        backupLog: arr
                    })
                }
            }.bind(this)
        })
    }
    _doCleanLog = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        let type = this.state.logtype === "rearrange" ? "rearrangelog" : "backuplog"
        let action = this.state.logtype === "rearrange" ? "action=reloadRearrangeLog" : "action=reloadHABackupLog"
        $.ajax({
            type: "GET",
            url: api.apiHost + action + "&" + type + "=",
            dataType: "json",
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    message.success(formatMessage({ id: "LANG3903"}))
                    this._readLog(this.state.logtype)
                }
            }.bind(this)
        })
    }
    _cleanLog = () => {
        const { formatMessage } = this.props.intl
        Modal.confirm({
                content: formatMessage({id: "LANG3902"}),
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"}),
                onOk: this._doCleanLog.bind(this)
            })
    }
    _cleanRearrangeLog = () => {
       this.setState({
            logtype: "rearrange"
        })
       this._cleanLog()
    }
    _cleanBackupLog = () => {
       this.setState({
            logtype: "backup"
        })
       this._cleanLog()
    }
    _getInitData = () => {
    }
    onChange() {

    }      
    _handleCancel = () => {
    }
    _handleSubmit = () => {
    }
    convertToMAC(mac) {
        if (mac) {
            var macArr = mac.split('')

            return (mac[0] + mac[1] + ":" + mac[2] + mac[3] + ":" + mac[4] + mac[5] + ":" + mac[6] + mac[7] + ":" + mac[8] + mac[9] + ":" + mac[10] + mac[11])
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form
        let bkp4web = {
            0: "-",
            1: formatMessage({id: "LANG5639"}),
            2: formatMessage({id: "LANG5640"}),
            3: formatMessage({id: "LANG5641"}),
            4: formatMessage({id: "LANG1006"}),
            5: formatMessage({id: "LANG5642"})
        }
        let haERR = {
            0: "",
            1: formatMessage({id: "LANG5643"}),
            2: formatMessage({id: "LANG5644"})
        }
        let logList = this.state.rearrangeLog || []
        const rearrangeLogList = logList.map((item, index) => {
            return (
                <row>
                    <Col>
                        <span style={item.indexOf("success") > -1 ? { color: 'green' } : { color: 'red' }}>{item}</span>
                    </Col>
                </row>
            )
        })
        logList = this.state.backupLog || []
        const backupLogList = logList.map((item, index) => {
            return (
                <row>
                    <Col>
                        <span style={item.indexOf("success") > -1 ? { color: 'green' } : { color: 'red' }}>{item}</span>
                    </Col>
                </row>
            )
        })
        const status = this.state.status

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        document.title = formatMessage({id: "LANG4360"})
        return (
            <div className="app-content-main" id="app-content-main">
                <FormItem
                    { ...formItemLayout }
                    label={formatMessage({id: "LANG5652"})}
                >
                    <span ref="haOL">
                        { status.haOL === "1" ? formatMessage({id: "LANG5646"}) : formatMessage({id: "LANG5645"}) }
                    </span>
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={formatMessage({id: "LANG5653"})}
                >
                    <span ref="bkp4web">
                        {bkp4web[status.bkp4web]}
                    </span>
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={formatMessage({id: "LANG5654"})}
                >
                    <span ref="haERR">
                        {haERR[status.haERR]}
                    </span>
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={formatMessage({id: "LANG5655"})}
                >
                    <span ref="mac">
                        {this.convertToMAC(status.mac)}
                    </span>
                </FormItem>
                <Row>
                    <Col span={ 24 }>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG5647"}) }</span>
                        </div>
                    </Col>
                </Row>
                <Row className="row-section-content">
                    <div>
                        <Button type="primary" onClick={ this._cleanBackupLog }>{formatMessage({id: "LANG743"})}</Button>
                    </div>
                    <div>
                        <p > <span >
                            { backupLogList }
                        </span></p>
                    </div>
                </Row>
                <Row>
                    <Col span={ 24 }>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG5648"}) }</span>
                        </div>
                    </Col>
                </Row>
                <Row className="row-section-content">
                    <div>
                        <Button type="primary" onClick={ this._cleanRearrangeLog }>{formatMessage({id: "LANG743"})}</Button>
                    </div>
                    <div>
                        <p > <span >
                            { rearrangeLogList }
                        </span></p>
                    </div>
                </Row>
            </div>
        )
    }
}

HaStatus.propTypes = {
}

export default injectIntl(HaStatus)
module.exports = Form.create()(injectIntl(HaStatus))

'use strict'

import $ from 'jquery'
import '../../../css/activityCall'
import _ from 'underscore'
import api from "../../api/api"
import { message, Button, Row, Col, Popconfirm, Modal, Select, Checkbox, Form, Input, Tooltip } from 'antd'
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'

const FormItem = Form.Item
const Option = Select.Option

let channel1Array = [],
    channel2Array = [],
    timer = null

class ActivityCall extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            callList: [],
            activeCallStatus: []
        }
    }
    componentDidMount() {
        this._loadBridgeChannel()
    }
    componentWillUnmount() {
        clearTimeout(timer)
    }
    _loadBridgeChannel = () => {
        clearTimeout(timer)

        let _this = this

        console.log('_loadBridgeChannel')

        $.ajax({
            dataType: 'json',
            type: 'post',
            url: api.apiHost,
            data: {
                "action": 'listBridgedChannels',
                "sidx": "callerid1",
                "sord": "asc"
            },
            success: function(res) {
                var bridgeChannel = []
                const response = res.response || {}

                if (response.channel) {
                    bridgeChannel = response.channel
                }

                $.ajax({
                    dataType: 'json',
                    type: 'post',
                    url: api.apiHost,
                    data: {
                        "action": 'listUnBridgedChannels',
                        "sidx": "state",
                        "sord": "asc"
                    },
                    success: function(res) {
                        var unBridgeChannel = []
                        const response = res.response || {}

                        if (response.channel) {
                            unBridgeChannel = response.channel
                        }

                        _.each(bridgeChannel, function(item) {
                            unBridgeChannel.push(item)
                        })

                        this.setState({
                            activeCallStatus: unBridgeChannel
                        })
                    }.bind(this),
                    error: function(e) {
                        console.log(e.statusText)
                    }
                })
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })

        timer = setTimeout(_this._loadBridgeChannel, 5000)
    }
    _hangUpAll = () => {
        const { formatMessage } = this.props.intl
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3011" })}}></span>
        let warningMessage = <span
                                dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG129" }, { 0: formatMessage({id: "LANG3006"}) })}}>
                            </span>
        if (this.state.activeCallStatus.length !== 0) {
            _.each(channel1Array, function(item, key) {
                let channel1 = item,
                    channel2 = channel2Array[key]

                $.ajax({
                    url: api.apiHost,
                    type: 'post',
                    data: {
                        action: 'Hangup',
                        Channel: channel1
                    },
                    dataType: 'json',
                    async: false,
                    success: function(res) {
                        if (channel2) {
                            $.ajax({
                                url: api.apiHost,
                                type: "post",
                                data: {
                                    action: 'Hangup',
                                    Channel: channel2
                                },
                                dataType: 'json',
                                async: false,
                                error: function(e) {
                                    message.error(e.statusText)
                                },
                                success: function(data) {
                                }.bind(this)
                            })
                        }
                    }.bind(this),
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            })

            message.success(successMessage)
        } else {
            message.warning(warningMessage)
        }
    }
    _hangUp = (channel1, channel2) => {
        let self = this
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3011" })}}></span>

        message.loading(loadingMessage, 0)

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                "action": "Hangup",
                "Channel": channel1
            },
            dataType: 'json',
            success: function(res) {
                var bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool && channel2) {
                    $.ajax({
                        url: api.apiHost,
                        type: 'post',
                        data: {
                            "action": "Hangup",
                            "Channel": channel2
                        },
                        dataType: 'json',
                        success: function(res) {
                            var bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(successMessage)
                            }
                        }.bind(this),
                        error: function(e) {
                            message.error(e.statusText)
                        }
                    })
                } else {
                    message.destroy()
                    message.success(successMessage)
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _monitor = () => {
        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let edit_extension = values.edit_extension.split('@'),
                    channel

                let action = {
                    action: 'callbarge',
                    channel: edit_extension[0],
                    exten: edit_extension[1],
                    mode: values.edit_mode, 
                    'barge-exten': values.create_user_id + '@' + (values.need_confirm ? '1' : '0')
                }

                $.ajax({
                    url: api.apiHost,
                    type: 'post',
                    data: action,
                    dataType: 'json',
                    async: false,
                    success: function(data) {
                        if (data && data.status === 0) {
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4751" })}}></span>)
                            this.setState({
                                visible: false
                            })
                        } else {
                            message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2198" })}}></span>)
                        }
                    }.bind(this),
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            } 
        })
    }
    _monitorCancel = () => {
        this.setState({
            visible: false
        })
    }
    _showMonitor = (callerid1, callerid2, channel1, channel2, unknown) => {
        if (channel2 === unknown) {
            channel2 = ''
        }

        let callList = [
            {
                'val': channel1,
                'text': callerid1
            }
        ]

        if (channel2 !== '') {
            callList.push({
                'val': channel2,
                'text': callerid2
            })
        }

        this.setState({
            visible: true,
            callList: callList
        })
    }
    _transChannelData = (data) => {
        var arr = []

        for (var i = 0; i < data.length; i++) {
            var channelIndex = data[i]

            if (channelIndex["alloc_time"]) {
                var state = channelIndex.state.toLocaleLowerCase(),
                    service = channelIndex.service.toLocaleLowerCase(),
                    channel = channelIndex.channel.toLocaleLowerCase()

                if (state === "rsrvd" || state === "down" || state === "ring" ||
                    (channel.indexOf('local') === 0 && (service === "normal" || service === "queue" || service === "confbridge"))) {
                    continue
                } else {
                    channelIndex["type"] = "unbridge"
                }

                if (state === "ringing") {
                    var tmp_name = channelIndex.callername,
                        tmp_num = channelIndex.callernum

                    channelIndex.callername = channelIndex.connectedname
                    channelIndex.callernum = channelIndex.connectednum

                    channelIndex.connectedname = tmp_name
                    channelIndex.connectednum = tmp_num
                }
            } else if (channelIndex["bridge_time"]) {
                channelIndex["type"] = "bridge"
            }

            arr.push(channelIndex)
        }

        return arr
    }
    _checkConnectState = (allocTime, callerState, connectednum) => {
        var matchArr = allocTime.match(/\d+/g),
            connectState = "connected"

        if (matchArr && parseInt(matchArr[0])) {
            connectState = "connectedWarning"
        } else if (matchArr && parseInt(matchArr[1]) > 30) {
            connectState = "connectedLongTime"
        } else if (callerState === "dialing" || callerState === "ring" || callerState === "ringing") {
            if (connectednum && connectednum === "s") {
                connectState = "connected"
            } else {
                connectState = "connectRinging"
            }
        }

        return connectState
    }
    _checkCalleeState = (channelIndex) => {
        var callerState = channelIndex.state.toLowerCase(),
            service = channelIndex.service.toLowerCase()

        if (service === "normal") {
            if (callerState === "dialing" || callerState === "pre-ring" || callerState === "ring" || callerState === "ringing") {
                service = "ringing"
            }
            if (callerState === "up") {
                service = "up"
            }
        }

        if (service === "macro-dial") {
            service = "normal"
        }
        return service || "unknown"
    }
    _getActivityTime = (currentTime, time) => {
        currentTime = currentTime.replace(/-/g, "/")

        var startTime = Date.parse(time.replace(/-/g, "/")),
            timeAry = currentTime.split(' '),
            milliseconds = Date.parse(timeAry[0] + " " + timeAry[1]) - startTime,
            activity

        if (milliseconds < 0) {
            milliseconds = 0
        }

        var days = UCMGUI.addZero(Math.floor(milliseconds / (24 * 3600 * 1000)))

        var leave1 = milliseconds % (24 * 3600 * 1000),
            hours = UCMGUI.addZero(Math.floor(leave1 / (3600 * 1000)))

        var leave2 = leave1 % (3600 * 1000),
            minutes = UCMGUI.addZero(Math.floor(leave2 / (60 * 1000)))

        var leave3 = leave2 % (60 * 1000),
            seconds = UCMGUI.addZero(Math.round(leave3 / 1000))

        if (days === '00') {
            activity = hours + ":" + minutes + ":" + seconds
        } else {
            activity = days + " " + hours + ":" + minutes + ":" + seconds
        }

        return activity
    }
    _getCurrentTime = () => {
        var currentTime = '1970-01-01 00:00:00 UTC+08:00'

        $.ajax({
                dataType: 'json',
                type: 'post',
                url: api.apiHost,
                data: {
                    "action": 'checkInfo'
                },
                async: false,
                success: function(data) {
                    if (data && data.status === 0) {
                        currentTime = data.response.current_time
                    }
                },
                error: function(e) {
                    console.log(e.statusText)
                }
            })

        return currentTime
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        let activeCallStatus = this.state.activeCallStatus

        /* let socketStatus = this.props.activeCallStatus,
            socketObj = {}

        if (socketStatus.length > 0) {
            socketObj = socketStatus[0]

            if (socketObj.action === 'add') {
                activeCallStatus.push(socketObj)
            } else if (socketObj.action === 'delete') {
                _.each(activeCallStatus, function(item, key) {
                    if (item.channel === socketObj.channel) {
                        activeCallStatus.splice(key, 1)
                        return false
                    }
                })
            } else if (socketObj.action === 'update') {
                _.each(activeCallStatus, function(item, key) {
                    if (item.channel === socketObj.channel) {
                        activeCallStatus.splice(key, 1, socketObj)
                        return false
                    }
                })
            }
        } */

        activeCallStatus = activeCallStatus.sort(UCMGUI.bySort("bridge_time ? alloc_time", "down"))
        activeCallStatus = this._transChannelData(activeCallStatus)
        let self = this
        let callList = this.state.callList

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG3006"})
                })

        var unknown = formatMessage({id: "LANG2403"}),
            channel1 = "",
            callerid1 = unknown,
            channel2 = unknown,
            callerid2 = unknown,
            time = unknown,
            callerState = "unknown",
            calleeState = "unknown",
            connectState = "",
            service = "",
            callerName,
            calleeName,
            allocTime,
            currentTime = this._getCurrentTime(),
            sliceCallerid1 = '',
            sliceCallerName = '',
            sliceCalleeName = '',
            timeType = '',
            spriteClock = 'sprite-clock'

        return (
            <div className="app-content-main app-content-cdr">
                <Title
                    headerTitle={ formatMessage({id: "LANG3006"}) }
                    isDisplay='hidden'/>
                <div className="content">
                    <div className="top-button">
                        <Popconfirm
                            title={ formatMessage({id: "LANG3012"}) }
                            okText={ formatMessage({id: "LANG727"}) }
                            cancelText={ formatMessage({id: "LANG726"}) }
                            onConfirm={ this._hangUpAll }
                        >
                            <Button
                                type="primary"
                                size="default"
                                icon="hangUp">
                                { formatMessage({id: "LANG3009"}) }
                            </Button>
                        </Popconfirm>
                    </div>
                    <Row>
                        {
                            activeCallStatus.map(function(channelIndex, key) {
                                if (channelIndex["type"] === "unbridge") {
                                    channel1 = channelIndex.channel
                                    callerid1 = channelIndex.callernum
                                    callerName = channelIndex.callername
                                    allocTime = self._getActivityTime(currentTime, channelIndex.alloc_time)
                                    time = allocTime
                                    callerid2 = channelIndex.connectednum || unknown
                                    calleeName = channelIndex.connectedname
                                    callerState = channelIndex.state.toLowerCase() || unknown
                                    calleeState = self._checkCalleeState(channelIndex)
                                    if (channelIndex.connectedname === "Call Bargin") {
                                        connectState = "connectBargin"
                                    } else {
                                        connectState = self._checkConnectState(allocTime, callerState, callerid2)
                                    }
                                } else if (channelIndex["type"] === "bridge") {
                                    channel1 = channelIndex.channel1
                                    callerid1 = channelIndex.callerid1
                                    callerName = channelIndex.name1
                                    time = self._getActivityTime(currentTime, channelIndex.bridge_time)
                                    connectState = self._checkConnectState(time, "busy")
                                    channel2 = channelIndex.channel2
                                    callerid2 = channelIndex.callerid2
                                    calleeName = channelIndex.name2
                                    callerState = "busy"
                                    calleeState = "busy"
                                }

                                if (callerid1) {
                                    if (/.*[\u4e00-\u9fa5]+.*$/.test(callerid1)) {
                                        sliceCallerid1 = callerid1.length > 10 ? (callerid1.slice(0, 10) + '...') : callerid1
                                    } else {
                                        sliceCallerid1 = callerid1.length > 20 ? (callerid1.slice(0, 20) + '...') : callerid1
                                    }
                                }

                                if (callerName) {
                                    sliceCallerName = callerName.length > 30 ? (callerName.slice(0, 30) + '...') : callerName
                                }

                                if (calleeName) {
                                    sliceCalleeName = calleeName.length > 30 ? (calleeName.slice(0, 30) + '...') : calleeName
                                }

                                channel1Array.push(channel1)
                                channel2Array.push(channel2)

                                return (
                                    <Col className="gutter-row table-list" key={ key }>
                                        <div className={ "callDiv " + connectState }>
                                            <div className="callTime">
                                                <span className="sprite sprite-clock"></span>
                                                <span className="activityTime">{ time }</span>
                                            </div>
                                            <div className="call-wrap clearfix">
                                                <div className="caller">
                                                    <span className={ "callState sprite " + callerState }></span>
                                                    <span className="callerNum" title={ callerid1 }>{ sliceCallerid1 }</span>
                                                    <span className="callerName" title={ callerName }>{ sliceCallerName }</span>
                                                </div>
                                                <div className={ "pointer connectState-div" }></div>
                                                <div className="callee">
                                                    <span className={ "callState sprite " + calleeState }></span>
                                                    <span className="calleeNum">{ callerid2 }</span>
                                                    <span className="calleeName" title={ calleeName }>{ sliceCalleeName }</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bottom-btn">
                                            <Popconfirm
                                                title={ formatMessage({id: "LANG3010"}) }
                                                okText={ formatMessage({id: "LANG727"}) }
                                                cancelText={ formatMessage({id: "LANG726"}) }
                                                onConfirm={ self._hangUp.bind(self, channel1, channel2) }
                                            >
                                                <Button
                                                    size="default"
                                                    className="hangUp"
                                                    title={ formatMessage({id: "LANG3007"}) }
                                                    icon="hangUp">
                                                </Button>
                                            </Popconfirm>
                                            <Button
                                                size="default"
                                                className="monitor"
                                                title={ formatMessage({id: "LANG3008"}) }
                                                icon="monitor"
                                                onClick={ self._showMonitor.bind(self, callerid1, callerid2, channel1, channel2, unknown)}
                                                disabled={ !(connectState.indexOf("connected") > -1) }>
                                            </Button>
                                        </div>
                                    </Col>
                                )
                            }) 
                        }
                    </Row>
                    <Modal 
                        title={ formatMessage({id: "LANG3008"}) }
                        visible={this.state.visible}
                        onOk={this._monitor} 
                        onCancel={this._monitorCancel}
                        okText={formatMessage({id: "LANG769"})}
                        cancelText={formatMessage({id: "LANG726"})}>
                        <Form>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3819" /> }>
                                        <span>{formatMessage({id: "LANG3819"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('create_user_id')(
                                    <Input />
                                )}
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3820" /> }>
                                        <span>{formatMessage({id: "LANG3820"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('edit_extension', {
                                    initialValue: callList[0] && (callList[0].val + '@' + callList[0].text)
                                })(
                                    <Select>
                                        {
                                            this.state.callList.map(function(item, key) {
                                                return (
                                                    <Option value={ item.val + '@' + item.text } key={ key }>{ item.text }</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3839" /> }>
                                        <span>{formatMessage({id: "LANG3838"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('edit_mode', {
                                    initialValue: ''
                                })(
                                    <Select>
                                        <Option value="">Listen</Option>
                                        <Option value="w">Whisper</Option>
                                        <Option value="B">Barge</Option>
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2352" /> }>
                                        <span>{formatMessage({id: "LANG2351"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('need_confirm', {
                                    valuePropName: 'checked',
                                    initialValue: true
                                })(
                                    <Checkbox />
                                )}
                            </FormItem>
                        </Form>
                    </Modal>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    activeCallStatus: state.activeCallStatus
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default Form.create()(connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActivityCall)))
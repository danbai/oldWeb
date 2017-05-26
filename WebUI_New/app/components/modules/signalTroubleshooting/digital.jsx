'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip, Button, Radio } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class Digital extends Component {
    constructor(props) {
        super(props)
        const { formatMessage } = this.props.intl
        this.state = {
            startDisable: true,
            stopDisable: true,
            downloadDisable: true,
            deleteDisable: true,
            isDisplayMode: true,
            emTraceStatus: {}
        }
    }
    componentDidMount = () => {
        this._loadPortList()
        this._getEm()
    }
    _directionChange = (e) => {
        this.setState({
            isDisplayMode: e === 'rs'
        })
    }
    _loadPortList = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getDigitalHardwareSettings',
                'span_type': ''
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var res = data.response
                if (res) {
                    var ports = 0,
                        optsArr = [],
                        digitalDriverSettings = res.digital_driver_settings

                    if (_.isArray(digitalDriverSettings) && digitalDriverSettings.length !== 0) {
                        var spanType = digitalDriverSettings[0]["span_type"].toLowerCase()
                        if (spanType === "e1") {
                            ports = 31
                        } else {
                            ports = 24
                        }
                    }

                    this.setState({
                        ports: ports
                    })
                }
            }.bind(this)
        })
    }
    _getEm = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'em_signaling_trace_query',
                'em_trace_switch': ''
            },
            error: function(e) {
                message.error(e.statusText)

                this._checkFailed(e)
            }.bind(this),
            success: function(data) {
                this._checkReturn(data)
            }.bind(this)
        })
    }
    _checkFailed = (e) => {
        this._buttonSwitch(false)
    }
    _stopInterval = () => {
        const { formatMessage } = this.props.intl

        let self = this

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'em_signaling_trace_query',
                'em_trace_switch': ''
            },
            error: function(e) {
                setTimeout(self._stopInterval, 1000)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    var emTraceStatus = data.response.em_trace_switch

                    if (!emTraceStatus.em_trace_switch && emTraceStatus.em_trace_stop_finish_flag === '0') {
                        this.setState({
                            msg: formatMessage({ id: "LANG3429" })
                        })

                        setTimeout(self._stopInterval, 1000)
                    } else if (!emTraceStatus.em_trace_switch && emTraceStatus.em_trace_stop_finish_flag === 1) {
                        this._buttonSwitch(false)
                    }
                }
            }.bind(this)
        })
    }
    _checkReturn = (val) => {
        const { formatMessage } = this.props.intl

        var emTraceStatus = val.response.em_trace_switch

        if (emTraceStatus.em_trace_switch) {
            this.setState({
                emTraceStatus: emTraceStatus,
                isDisplayMode: emTraceStatus.em_trace_direction === 'rs'
            })

            this._buttonSwitch(true)
        } else if (emTraceStatus.em_trace_stop_finish_flag === 0) {
            this.setState({
                tartDisable: true,
                stopDisable: true,
                downloadDisable: true,
                deleteDisable: true,
                ss7Disable: true
            })

            this._stopInterval()
        } else {
            this._buttonSwitch(false)
        }
    }
    _buttonSwitch = (start) => {
        const { formatMessage } = this.props.intl

        this.setState({
            startDisable: start,
            stopDisable: !start
        })

        if (!start) {
            this.setState({
                ss7Disable: false
            })
            this._btnDownloadCcheckState()
        } else {
            this.setState({
                ss7Disable: true,
                msg: formatMessage({ id: "LANG1582" })
            })
        }
    }
    _btnDownloadCcheckState = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'checkFile',
                'type': 'em_signaling_trace'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                if (data && data.hasOwnProperty('status') && data.status === 0) {
                    this.setState({
                        downloadDisable: false,
                        deleteDisable: false,
                        msg: formatMessage({id: "LANG1581"})
                    })
                } else {
                    this.setState({
                        downloadDisable: true,
                        deleteDisable: true,
                        msg: formatMessage({id: "LANG3430"})
                    })
                }
            }.bind(this)
        })
    }
    _start = () => {
        const { formatMessage } = this.props.intl

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                let ports = parseInt(values.ports, 10) + 4,
                    direct = values.direction,
                    mode = ''

                if (direct === 'rs') {
                    mode = values.mode
                }

                message.loading(loadingMessage, 0)

                this.setState({
                    downloadDisable: true,
                    deleteDisable: true,
                    msg: ''
                })

                let data = {
                    'action': 'em_signaling_trace',
                    'control': 'start,' + ports + ',' + direct + ',' + mode
                }

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: data,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    }.bind(this),
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            this._buttonSwitch(true)
                        }
                    }.bind(this)
                })
            }
        })
    }
    _stop = () => {
        const { formatMessage } = this.props.intl
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3247" })}}></span>

        message.loading(loadingMessage, 0)

        this.setState({
            downloadDisable: true,
            deleteDisable: true,
            stopDisable: true
        })

        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'em_signaling_trace',
                control: 'stop'
            },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    this._stopInterval()
                }
            }.bind(this)
        })
    }
    _download = () => {
        window.open(api.apiHost + "action=downloadFile&type=em_signaling_trace", '_self')
    }
    _delete = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'removeFile',
                type: 'em_signaling_trace'
            },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    this._buttonSwitch(false)
                }
            }.bind(this)
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        let emTraceStatus = this.state.emTraceStatus

        return (
            <div className="content">
                <div>
                    <Form>
                        <Row>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4022" /> }>
                                            <span>{ formatMessage({id: "LANG4022"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('ports', {
                                        initialValue: this.state.ports || 24
                                    })(
                                        <Input disabled />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3240" /> }>
                                            <span>{ formatMessage({id: "LANG3240"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('direction', {
                                        initialValue: emTraceStatus.em_trace_direction || 'rs'
                                    })(
                                        <Select disabled={ this.state.ss7Disable } onChange={ this._directionChange }>
                                            <Option value="rs">{ formatMessage({id: "LANG1959"}) }</Option>
                                            <Option value="r">{ formatMessage({id: "LANG3241"}) }</Option>
                                            <Option value="s">{ formatMessage({id: "LANG3242"}) }</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row className={ this.state.isDisplayMode ? 'display-block' : 'hidden' }>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3244" /> }>
                                            <span>{ formatMessage({id: "LANG3244"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('mode', {
                                        initialValue: emTraceStatus.em_trace_mode || 'sep'
                                    })(
                                        <Select disabled={ this.state.ss7Disable }>
                                            <Option value="sep">{ formatMessage({id: "LANG3246"}) }</Option>
                                            <Option value="mix">{ formatMessage({id: "LANG3245"}) }</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="top-button">
                            <Button
                                type="primary"
                                size="default"
                                disabled={ this.state.startDisable }
                                onClick={ this._start }
                            >
                                { formatMessage({id: "LANG724"}) }
                            </Button>
                            <Button
                                type="primary"
                                size="default"
                                disabled={ this.state.stopDisable }
                                onClick={ this._stop }
                            >
                                { formatMessage({id: "LANG725"}) }
                            </Button>
                            <Button
                                type="primary"
                                size="default"
                                disabled={ this.state.downloadDisable }
                                onClick={ this._download }
                            >
                                { formatMessage({id: "LANG759"}) }
                            </Button>
                            <Button
                                type="primary"
                                size="default"
                                disabled={ this.state.deleteDisable }
                                onClick={ this._delete }
                            >
                                { formatMessage({id: "LANG739"}) }
                            </Button>
                        </div>
                        <div className="lite-desc">
                            { formatMessage({id: "LANG666"}) }
                        </div>
                        <div>{ this.state.msg }</div>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(Digital))
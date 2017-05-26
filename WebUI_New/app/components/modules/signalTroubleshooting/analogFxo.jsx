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
import { Col, Form, Input, message, Row, Transfer, Tooltip, Button, Modal } from 'antd'

const FormItem = Form.Item

class AnalogFxo extends Component {
    constructor(props) {
        super(props)
        const { formatMessage } = this.props.intl
        this.state = {
            startDisable: true,
            stopDisable: true,
            downloadDisable: true,
            deleteDisable: true
        }
    }
    componentDidMount = () => {
        this._getFxo()
    }
    _getFxo = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'get_analog_signal_auto_trace'
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
    _checkReturn = (val) => {
        const { formatMessage } = this.props.intl

        var analogTraceStatus = val.response.analog_signal_auto_trace_start

        if (analogTraceStatus === 1) {
            this._buttonSwitch(true)
        } else {
            this._buttonSwitch(false)
        }
    }
    _buttonSwitch = (start, isCheckState) => {
        const { formatMessage } = this.props.intl

        this.setState({
            startDisable: start,
            stopDisable: !start
        })

        if (!start) {
            this.setState({
                fxoDisable: false
            })
            this._btnDownloadCcheckState()
        } else {
            this.setState({
                fxoDisable: true,
                msg: formatMessage({id: 'LANG1582'})
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
                'type': 'analog_signal_auto_trace'
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
                        msg: ''
                    })
                }
            }.bind(this)
        })
    }
    _fxoStart = () => {
        const { formatMessage } = this.props.intl
        let self = this

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'analog_signaling_trace_query',
                'analog_trace_switch': ''
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
                this._checkFailed(e)
            }.bind(this),
            success: function(data) {
                var analogTraceStatus = data.response.analog_trace_switch

                if (analogTraceStatus.analog_trace_switch) {
                    Modal.confirm({
                        content: formatMessage({id: "LANG5083" }),
                        okText: formatMessage({id: "LANG727" }),
                        cancelText: formatMessage({id: "LANG726" }),
                        onOk() {
                            self._stop()
                            self._start()
                        },
                        onCancel() {}
                    })
                } else {
                    this._start()
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

                message.loading(loadingMessage, 0)

                this.setState({
                    downloadDisable: true,
                    deleteDisable: true,
                    msg: ''
                })

                let data = {
                    'action': 'analog_signal_auto_trace',
                    'analog_control': 'start',
                    'ext_extension': values.ext_extension
                }

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: data,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                        this._buttonSwitch(false, false)
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
    _stopInterval = () => {
        const { formatMessage } = this.props.intl

        let self = this

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'get_analog_signal_auto_trace'
            },
            error: function(e) {
                setTimeout(self._stopInterval, 1000)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    var analogTraceStatus = data.response.analog_signal_auto_trace_start

                    if (analogTraceStatus === 1) {
                        this.setState({
                            msg: formatMessage({ id: "LANG3429" })
                        })

                        setTimeout(self._stopInterval, 1000)
                    } else if (analogTraceStatus === '0') {
                        this._buttonSwitch(false)
                    }
                }
            }.bind(this)
        })
    }
    _stop = () => {
        const { formatMessage } = this.props.intl
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3247" })}}></span>

        message.loading(loadingMessage, 0)

        this.setState({
            downloadDisable: true,
            deleteDisable: true
        })

        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'analog_signal_auto_trace',
                analog_control: 'stop',
                ext_extension: ''
            },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    this._stopInterval(false)
                }
            }.bind(this)
        })
    }
    _download = () => {
        window.open(api.apiHost + "action=downloadFile&type=analog_signal_auto_trace", '_self')
    }
    _delete = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'analog_signal_auto_trace',
                analog_control: 'remove',
                ext_extension: ''
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

        return (
            <Form>
                <Row>
                    <Col span={ 12 }>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5084" /> }>
                                    <span>{ formatMessage({id: "LANG5084"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('ext_extension', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 2)
                                    }
                                }]
                            })(
                                <Input disabled={ this.state.fxoDisable } />
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <div className="top-button">
                    <Button
                        type="primary"
                        size="default"
                        disabled={ this.state.startDisable }
                        onClick={ this._fxoStart }
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
        )
    }
}

export default Form.create()(injectIntl(AnalogFxo))
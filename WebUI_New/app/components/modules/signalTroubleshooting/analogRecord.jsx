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
const CheckboxGroup = Checkbox.Group

let fxoOptions = [],
    fxsOptions = []

class AnalogRecord extends Component {
    constructor(props) {
        super(props)
        const { formatMessage } = this.props.intl
        this.state = {
            startDisable: true,
            stopDisable: true,
            downloadDisable: true,
            deleteDisable: true,
            isDisplayMode: true,
            analogTraceStatus: {},
            fxoList: [],
            fxsList: []
        }
    }
    componentDidMount = () => {
        this._getRecord()
    }
    _directionChange = (e) => {
        this.setState({
            isDisplayMode: e === 'rs'
        })
    }
    _getRecord = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'analog_signaling_trace_query',
                'analog_trace_switch': ''
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
                'action': 'analog_signaling_trace_query',
                'analog_trace_switch': ''
            },
            error: function(e) {
                setTimeout(self._stopInterval, 1000)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    var analogTraceStatus = data.response.analog_trace_switch

                    if (!analogTraceStatus.analog_trace_switch && analogTraceStatus.analog_trace_stop_finish_flag === '0') {
                        this.setState({
                            msg: formatMessage({ id: "LANG3429" })
                        })

                        setTimeout(self._stopInterval, 1000)
                    } else if (!analogTraceStatus.analog_trace_switch && analogTraceStatus.analog_trace_stop_finish_flag === 1) {
                        this._buttonSwitch(false)
                    }
                }
            }.bind(this)
        })
    }
    _checkReturn = (val) => {
        const { formatMessage } = this.props.intl

        var analogTraceStatus = val.response.analog_trace_switch

        if (analogTraceStatus.analog_trace_switch) {
            let ports = analogTraceStatus.analog_trace_port.split('-')

            this.setState({
                analogTraceStatus: analogTraceStatus,
                isDisplayMode: analogTraceStatus.analog_trace_mode === 'rs'
            })

            this._buttonSwitch(true)
        } else if (analogTraceStatus.analog_trace_stop_finish_flag === '0') {
            this.setState({
                tartDisable: true,
                stopDisable: true,
                downloadDisable: true,
                deleteDisable: true,
                recordDisable: true
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
                recordDisable: false
            })
            this._btnDownloadCcheckState()
        } else {
            this.setState({
                recordDisable: true,
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
                'type': 'analog_signaling_trace'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                if (data && data.hasOwnProperty('status') && data.status === 0 && data.response.result === 0) {
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
        let errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                            0: formatMessage({id: "LANG237"}).toLowerCase()
                        })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
                if (values.fxo.length === 0 && values.fxs.length === 0) {
                    message.error(errorMessage)
                    return
                }

                let foxPortsArr = values.fxo,
                    fsxPortsArr = values.fxs,
                    newFsxPortsArr = []

                _.each(fsxPortsArr, function(item, key) {
                    newFsxPortsArr.push(parseInt(item) + foxPortsArr.length)
                })

                foxPortsArr = foxPortsArr.concat(newFsxPortsArr)

                let ports = foxPortsArr.join('_'),
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
                    'action': 'analog_signaling_trace',
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
                action: 'analog_signaling_trace',
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
        window.open(api.apiHost + "action=downloadFile&type=analog_signaling_trace", '_self')
    }
    _delete = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'removeFile',
                type: 'analog_signaling_trace'
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
    _fxoChange = (e) => {
        this.setState({
            fxoAll: e.length === fxoOptions.length,
            fxoList: e
        })
    }
    _onFxoAllChange = (e) => {
        const { setFieldsValue } = this.props.form

        this.setState({
            fxoAll: e.target.checked,
            fxoList: e.target.checked ? fxoOptions : []
        })

        setFieldsValue({
            fxo: e.target.checked ? fxoOptions : []
        })
    }
    _fxsChange = (e) => {
        this.setState({
            fxsAll: e.length === fxsOptions.length,
            fxsList: e
        })
    }
    _onFxsAllChange = (e) => {
        const { setFieldsValue } = this.props.form

        this.setState({
            fxsAll: e.target.checked,
            fxsList: e.target.checked ? fxsOptions : []
        })

        setFieldsValue({
            fxs: e.target.checked ? fxsOptions : []
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 12 }
        }
        const formItemLayoutOffset = {
            wrapperCol: { span: 12, offset: 3 }
        }

        let analogTraceStatus = this.state.analogTraceStatus

        let fxo = parseInt(model_info.num_fxo),
            fxs = parseInt(model_info.num_fxs)

        fxoOptions = []
        fxsOptions = []

        if (fxo) {
            for (let i = 1; i <= fxo; i++) {
                fxoOptions.push(i.toString())
            }
        }

        if (fxs) {
            for (let j = 1; j <= fxs; j++) {
                fxsOptions.push(j.toString())
            }
        }

        return (
            <Form className="analog-content">
                <div className="port-title">
                    <span>{ formatMessage({id: "LANG3239"}) }</span>
                </div>
                <Row className="row-section-content">
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1724" /> }>
                                <span>{ formatMessage({id: "LANG1724"}) }</span>
                            </Tooltip>
                        )}
                    >
                        <Checkbox
                            checked={ this.state.fxoAll }
                            onChange={ this._onFxoAllChange }
                            disabled={ this.state.recordDisable } />
                        <span className="port-span">{formatMessage({id: "LANG104"})}</span>
                        <div style={{ display: 'inline-block' }}>
                            { getFieldDecorator('fxo', {
                                initialValue: this.state.fxoList
                            })(
                                <CheckboxGroup
                                    options={ fxoOptions }
                                    disabled={ this.state.recordDisable }
                                    onChange={ this._fxoChange } />
                            )}
                        </div>
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1725" /> }>
                                <span>{ formatMessage({id: "LANG1725"}) }</span>
                            </Tooltip>
                        )}
                    >
                        <Checkbox
                            checked={ this.state.fxsAll }
                            onChange={ this._onFxsAllChange }
                            disabled={ this.state.recordDisable } />
                        <span className="port-span">{formatMessage({id: "LANG104"})}</span>
                        <div style={{ display: 'inline-block' }}>
                            { getFieldDecorator('fxs', {
                                initialValue: this.state.fxsList
                            })(
                                <CheckboxGroup
                                    options={ fxsOptions }
                                    disabled={ this.state.recordDisable }
                                    onChange={ this._fxsChange } />
                            )}
                        </div>
                    </FormItem>
                </Row>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <Tooltip title={ <FormattedHTMLMessage id="LANG3240" /> }>
                            <span>{ formatMessage({id: "LANG3240"}) }</span>
                        </Tooltip>
                    )}
                >
                    { getFieldDecorator('direction', {
                        initialValue: analogTraceStatus.analog_trace_direction || 'rs'
                    })(
                        <Select disabled={ this.state.recordDisable } onChange={ this._directionChange }>
                            <Option value="rs">{ formatMessage({id: "LANG1959"}) }</Option>
                            <Option value="r">{ formatMessage({id: "LANG3241"}) }</Option>
                            <Option value="s">{ formatMessage({id: "LANG3242"}) }</Option>
                        </Select>
                    )}
                </FormItem>
                <Row className={ this.state.isDisplayMode ? 'display-block' : 'hidden' }>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <Tooltip title={ <FormattedHTMLMessage id="LANG3244" /> }>
                                <span>{ formatMessage({id: "LANG3244"}) }</span>
                            </Tooltip>
                        )}
                    >
                        { getFieldDecorator('mode', {
                            initialValue: analogTraceStatus.analog_trace_mode || 'sep'
                        })(
                            <Select disabled={ this.state.recordDisable }>
                                <Option value="sep">{ formatMessage({id: "LANG3246"}) }</Option>
                                <Option value="mix">{ formatMessage({id: "LANG3245"}) }</Option>
                            </Select>
                        )}
                    </FormItem>
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
        )
    }
}

export default Form.create()(injectIntl(AnalogRecord))
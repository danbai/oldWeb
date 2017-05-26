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

class Ss7Signal extends Component {
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
        this._getSS7()
    }
    _getSS7 = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getSS7SignalingTrace',
                'ss7_trace_switch': ''
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
    _checkDisable = (isDisabled) => {
        this.setState({
            ss7Disable: isDisabled
        })
    }
    _checkFailed = (e) => {
        this._buttonSwitch(false)
    }
    _checkReturn = (val) => {
        const { formatMessage } = this.props.intl

        var ss7TraceStatus = val.response.ss7_trace_switch

        if (ss7TraceStatus) {
            this._buttonSwitch(true)
            this.setState({
                msg: formatMessage({id: "LANG1582"})
            })
        } else {
            this._buttonSwitch(false)
        }
    }
    _buttonSwitch = (start, isCheckState) => {
        this.setState({
            startDisable: start,
            stopDisable: !start
        })

        if (!start && !isCheckState) {
            this._btnDownloadCcheckState()
        }
    }
    _btnDownloadCcheckState = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'checkFile',
                'type': 'ss7_signaling_trace'
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
    _start = () => {
        const { formatMessage } = this.props.intl

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                let nMsgItem = 0,
                    aMsg = values.msg_items

                if (aMsg.length === 0) {
                    message.warning(formatMessage({ id: "LANG2168" }, { 0: '1' }))
                    return
                }

                _.each(aMsg, function(item) {
                    nMsgItem += parseInt(item, 10)
                })

                message.loading(loadingMessage, 0)

                this._buttonSwitch(true)

                this.setState({
                    downloadDisable: true,
                    deleteDisable: true,
                    msg: ''
                })

                let data = {
                    'action': 'traceSS7Signaling',
                    'control': 'start ' + values.direction + ' ' + nMsgItem
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
                            this.setState({
                                msg: formatMessage({ id: "LANG1582" })
                            })
                            this._checkDisable(true)
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
            deleteDisable: true
        })
        this._checkDisable()

        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'traceSS7Signaling',
                control: 'stop'
            },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (!bool && data.status === -27) {
                    message.error(formatMessage({ id: "LANG3460" }))
                }

                if (bool) {
                    message.destroy()
                    this._buttonSwitch(false)
                }
            }.bind(this)
        })
    }
    _download = () => {
        window.open(api.apiHost + "action=downloadFile&type=ss7_signaling_trace", '_self')
    }
    _delete = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'removeFile',
                type: 'ss7_signaling_trace'
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

        const msgOptions = [
            {label: 'LSSU', value: '1'},
            {label: 'FISU', value: '2'},
            {label: 'MSU', value: '3'}
        ]

        return (
            <div className="content">
                <div>
                    <Form>
                        <Row>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG652" /> }>
                                            <span>{ formatMessage({id: "LANG652"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('msg_items', {
                                        initialValue: ['1', '2', '3']
                                    })(
                                        <CheckboxGroup options={ msgOptions } disabled={ this.state.ss7Disable } />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1578" /> }>
                                            <span>{ formatMessage({id: "LANG1577"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('direction', {
                                        initialValue: 'both'
                                    })(
                                        <Select disabled={ this.state.ss7Disable }>
                                            <Option value="both">{ formatMessage({id: "LANG1959"}) }</Option>
                                            <Option value="in">{ formatMessage({id: "LANG3241"}) }</Option>
                                            <Option value="out">{ formatMessage({id: "LANG3242"}) }</Option>
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

export default Form.create()(injectIntl(Ss7Signal))
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

let repeat = null

class IPPing extends Component {
    constructor(props) {
        super(props)
        const { formatMessage } = this.props.intl
        this.state = {
            startDisable: false,
            stopDisable: true
        }
    }
    componentDidMount = () => {

    }
    _valOrDefault = (val, def) => {
        return (val === undefined || val === null) ? def : val
    }
    _buttonSwitch = (start) => {
        this.setState({
            startDisable: start,
            stopDisable: !start
        })

        if (start) {
            this.setState({
                ipDisable: true
            })
        } else {
            this.setState({
                ipDisable: false
            })
        }
    }
    _dataBind = (val) => {
        const { formatMessage } = this.props.intl

        var done = false,
            output,
            self = this

        val = val.response.body

        if (typeof val === "object") {
            if (val.ping) {
                output = this._valOrDefault(val.ping.content)
                done = this._valOrDefault(val.ping.finish, false)
            }
        } else {
            output = val
        }

        if (output) {
            output = output.replace(/\n/ig, "<br/>")

            this.setState({
                msg: output
            })
        }

        if (!done) {
            repeat = setTimeout(self._repeatRequest, 1000)
        } else {
            this._buttonSwitch(false)
            this.setState({
                msg: this.state.msg + 'done'
            })
        }
    }
    _onResponseError = (val) => {
        this.setState({
            msg: this._valOrDefault(val.response.body, "UNKNOWN ERROR")
        })
    }
    _start = () => {
        let loadingMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage, 0)

                this._buttonSwitch(true)

                let data = {
                    'action': 'startTroubleShooting',
                    'ping': values.ping
                }

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: data,
                    type: 'json',
                    error: function(e) {
                        this._onResponseError(e)

                        message.error(e.statusText)
                    }.bind(this),
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            this._dataBind(data)
                        } else {
                            this._buttonSwitch(false)
                            this.setState({
                                msg: data.response.body
                            })
                        }
                    }.bind(this)
                })
            }
        })
    }
    _stop = () => {
        const { formatMessage } = this.props.intl
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3247" })}}></span>

        clearTimeout(repeat)
        repeat = null

        this.setState({
            stopDisable: true
        })

        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'stopTroubleShooting',
                ping: ''
            },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    this._dataBind(data)
                }
            }.bind(this)
        })
    }
    _repeatRequest = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'getTroubleShooting',
                ping: ''
            },
            type: 'json',
            error: function(e) {
                this._onResponseError(e)

                message.error(e.statusText)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    this._dataBind(data)
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
            <div className="content">
                <Form>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1584" /> }>
                                            <span>{ formatMessage({id: "LANG1583"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('ping', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.host(data, value, callback, formatMessage, 'IP or URL')
                                        }
                                    }]
                                })(
                                    <Input disabled={ this.state.ipDisable } />
                                ) }
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
                    </div>
                    <div className="lite-desc">
                        { formatMessage({id: "LANG666"}) }
                    </div>
                    <div>{ this.state.msg }</div>
                </Form>
            </div>
        )
    }
}

export default Form.create()(injectIntl(IPPing))
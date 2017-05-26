'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Button, Radio } from 'antd'

class MfcSignal extends Component {
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
        this._getMfc()
    }
    _getMfc = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getMFCR2Signalingtrace',
                'trace_switch': ''
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

        var mfcTraceStatus = val.response.trace_switch

        if (mfcTraceStatus) {
            this._buttonSwitch(true)
            this.setState({
                msg: formatMessage({id: "LANG1582"})
            })
        } else {
            this._buttonSwitch(false)
        }
    }
    _buttonSwitch = (start) => {
        this.setState({
            startDisable: start,
            stopDisable: !start
        })

        if (!start) {
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
                'type': 'mfcr2_signaling_trace'
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

        message.loading(loadingMessage, 0)

        this._buttonSwitch(true)

        this.setState({
            downloadDisable: true,
            deleteDisable: true,
            msg: ''
        })

        let data = {
            'action': 'traceMFCR2Signaling',
            'control': 'start'
        }

        $.ajax({
            url: api.apiHost,
            method: "post",
            data: data,
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
                this._buttonSwitch(false)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    this.setState({
                        msg: formatMessage({ id: "LANG1582" })
                    })
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
                action: 'traceMFCR2Signaling',
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
                    this._buttonSwitch(false)
                }
            }.bind(this)
        })
    }
    _download = () => {
        window.open(api.apiHost + "action=downloadFile&type=mfcr2_signaling_trace", '_self')
    }
    _delete = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'removeFile',
                type: 'mfcr2_signaling_trace'
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
            <div className="content">
                <div>
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
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(MfcSignal))
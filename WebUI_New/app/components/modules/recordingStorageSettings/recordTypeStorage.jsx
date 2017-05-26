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
import { Form, Input, message, Select, Tooltip, Checkbox, Row, Col, Transfer } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class RecordTypeStorage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            enableMonitor: true,
            enableMeetme: true,
            enableQueue: true,
            enableAllRecord: true
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
    }

    _onChangeCopyMonitor= (e) => {
        console.log('copy monitor: ', e.target.checked)
        const enableMonitor = e.target.checked
        const enableMeetme = this.state.enableMeetme
        const enableQueue = this.state.enableQueue

        if (e.target.checked) {
            this.setState({
                enableMonitor: true
            })
        } else {
            this.setState({
                enableMonitor: false,
                enableAllRecord: false
            })
        }

        if (enableMonitor && enableMeetme && enableQueue) {
            this.setState({
                enableAllRecord: true
            })
        }
    }

    _onChangeCopyMeetme= (e) => {
        console.log('copy meetme: ', e.target.checked)
        const enableMonitor = this.state.enableMonitor
        const enableMeetme = e.target.checked
        const enableQueue = this.state.enableQueue
        if (e.target.checked) {
            this.setState({
                enableMeetme: true
            })
        } else {
            this.setState({
                enableMeetme: false,
                enableAllRecord: false
            })
        }

        if (enableMonitor && enableMeetme && enableQueue) {
            this.setState({
                enableAllRecord: true
            })
        }
    }

    _onChangeCopyQueue= (e) => {
        console.log('copy queue: ', e.target.checked)
        const enableMonitor = this.state.enableMonitor
        const enableMeetme = this.state.enableMeetme
        const enableQueue = e.target.checked

        if (e.target.checked) {
            this.setState({
                enableQueue: true
            })
        } else {
            this.setState({
                enableQueue: false,
                enableAllRecord: false
            })
        }

        if (enableMonitor && enableMeetme && enableQueue) {
            this.setState({
                enableAllRecord: true
            })
        }
    }

    _onChangeCopyAll= (e) => {
        console.log('copy all: ', e.target.checked)
        if (e.target.checked) {
            this.setState({
                enableMonitor: true,
                enableMeetme: true,
                enableQueue: true,
                enableAllRecord: true
            })
        } else {
            this.setState({
                enableMonitor: false,
                enableMeetme: false,
                enableQueue: false,
                enableAllRecord: false
            })
        }
    }

    _handleCancel = () => {
        browserHistory.push('/pbx-settings/recordingStorageSettings')
    }

    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        let copyModule = []
        const { formatMessage } = this.props.intl
        const storeMode = this.props.params.id

        if (this.state.enableMonitor) {
            copyModule.push('monitor')
        }
        if (this.state.enableMeetme) {
            copyModule.push('meetme')
        }
        if (this.state.enableQueue) {
            copyModule.push('queue')
        }
        copyModule = copyModule.join('-')

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = {}
                action.action = 'removeFile'
                action.type = 'voice_recording'
                action.data = 'none'

                console.log('action: ', action)
                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            $.ajax({
                                url: api.apiHost,
                                method: "post",
                                data: {
                                    "action": 'cpRecordings',
                                    "cp_dest": storeMode,
                                    "cp_type": copyModule
                                },
                                type: 'json',
                                error: function(e) {
                                    message.error(e.statusText)
                                },
                                success: function(data) {
                                    const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                    if (bool) {
                                        message.destroy()
                                        message.success(successMessage)
                                    }

                                    this._handleCancel()
                                }.bind(this)
                            })
                        }
                    }.bind(this)
                })
            }
        })
    }

    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG3756"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG3756"}))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                />
                <div className="content">
                    <Form>
                        <div className="function-description">
                            <span>{ formatMessage({id: "LANG3758"}) }</span>
                        </div>
                        <FormItem
                            ref="div_monitor"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3764" />}>
                                    <span>{formatMessage({id: "LANG2640"})}</span>
                                </Tooltip>
                            }>
                                <Checkbox
                                    onChange={ this._onChangeCopyMonitor }
                                    checked={ this.state.enableMonitor }
                                />
                        </FormItem>

                        <FormItem
                            ref="div_meetme"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3765" />}>
                                    <span>{formatMessage({id: "LANG18"})}</span>
                                </Tooltip>
                            }>
                                <Checkbox
                                    onChange={ this._onChangeCopyMeetme }
                                    checked={ this.state.enableMeetme }
                                />
                        </FormItem>

                        <FormItem
                            ref="div_queue"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3766" />}>
                                    <span>{formatMessage({id: "LANG2377"})}</span>
                                </Tooltip>
                            }>
                                <Checkbox
                                    onChange={ this._onChangeCopyQueue }
                                    checked={ this.state.enableQueue }
                                />
                        </FormItem>

                        <FormItem
                            ref="div_all_recordings"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3767" />}>
                                    <span>{formatMessage({id: "LANG104"})}</span>
                                </Tooltip>
                            }>
                                <Checkbox
                                    onChange={ this._onChangeCopyAll }
                                    checked={ this.state.enableAllRecord }
                                />
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(RecordTypeStorage))
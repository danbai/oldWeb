'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Button, Checkbox, Form, Input, message, Tooltip, Popconfirm, Modal } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

const FormItem = Form.Item

class VoicemailItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            attach: false,
            reserve: false,
            showReserve: 'hidden',
            reserveVisible: false
        }
    }
    componentDidMount() {
        this._getVMSettings()
    }
    _emailConfirm = () => {
        browserHistory.push('/system-settings/emailSettings/template')
    }
    _getVMSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getVMSettings',
                reserve: '',
                attach: ''
            },
            type: 'json',
            async: false,
            success: function(res) {
                let response = res.response || {}
                let voicemail_settings = response.voicemail_settings || {}

                this.setState({
                    attach: (voicemail_settings.attach === 'yes'),
                    reserve: (voicemail_settings.reserve === 'yes'),
                    showReserve: (voicemail_settings.attach === 'yes' ? 'display-block' : 'hidden')
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/voicemail/1')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = values

                action.action = 'updateVMSettings'
                action.attach = (action.attach ? 'yes' : 'no')
                action.reserve = (action.reserve ? 'yes' : 'no')

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}} ></span>)

                            this._handleCancel()
                        }
                    }.bind(this)
                })
            }
        })
    }
    _handleReserveVisibleChange = (visible) => {
        if (!visible) {
            this.setState({
                reserveVisible: visible
            })

            return
        }
    }
    _onEnableChange = (e) => {
        this.setState({
            showReserve: (e.target.checked ? 'display-block' : 'hidden')
        })
    }
    _onReserveChange = (e) => {
        if (!e.target.checked) {
            this.setState({
                reserveVisible: true
            })
        } else {
            this.setState({
                reserveVisible: false
            })
        }
    }
    _reserveConfirm = () => {
        this.setState({
            reserveVisible: false
        })
    }
    _reserveCancel = () => {
        this.setState({
            reserveVisible: false
        })

        this.props.form.setFieldsValue({
            reserve: true
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG767"})})

        return (
            <div className="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG767"}) } onSubmit={ this._handleSubmit } onCancel={ this._handleCancel } isDisplay='display-block' />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1520" /> }>
                                        <span>{ formatMessage({id: "LANG1519"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('attach', {
                                valuePropName: 'checked',
                                initialValue: this.state.attach
                            })(
                                <Checkbox onChange={ this._onEnableChange } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4285" /> }>
                                        <span>{ formatMessage({id: "LANG4284"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                            className={ this.state.showReserve }
                        >
                            { getFieldDecorator('reserve', {
                                valuePropName: 'checked',
                                initialValue: this.state.reserve
                            })(
                                <Checkbox onChange={ this._onReserveChange } />
                            ) }
                        </FormItem>
                        <Modal
                            onOk={ this._reserveConfirm }
                            onCancel={this._reserveCancel}
                            visible={ this.state.reserveVisible }
                            okText={ formatMessage({id: "LANG727"}) }
                            cancelText={ formatMessage({id: "LANG726"}) }
                        >
                            <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4286" })}}></span>
                        </Modal>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4572" /> }>
                                        <span>{ formatMessage({id: "LANG4572"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <Popconfirm
                                onConfirm={ this._emailConfirm }
                                okText={ formatMessage({id: "LANG136"}) }
                                cancelText={ formatMessage({id: "LANG137"}) }
                                title={ <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG843" }, {0: formatMessage({id: "LANG4572"})})}}></span> }
                            >
                                <a href="#">{ formatMessage({id: "LANG4572"}) }</a>
                            </Popconfirm>
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(VoicemailItem))
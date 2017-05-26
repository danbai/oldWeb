'use strict'

import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select } from 'antd'
const FormItem = Form.Item
import _ from 'underscore'
import Validator from "../../api/validator"
import UCMGUI from "../../api/ucmgui"

class General extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount () {
    }

    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        let SIPGenSettings = this.props.dataSource

        return (
            <div className="content">
                <Form>
                    <div className="hidden">
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1766" /> }>
                                    <span>{ formatMessage({id: "LANG1751"}) }</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('context', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [],
                                initialValue: SIPGenSettings.context
                            })(
                                <Input maxLength="20" />
                            ) }
                        </FormItem>
                    </div>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1766" /> }>
                                    <span>{ formatMessage({id: "LANG1765"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('realm', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.alphanumeric(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: SIPGenSettings.realm
                        })(
                            <Input maxLength="30" />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1767" /> }>
                                    <span>{ formatMessage({id: "LANG1768"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('bindport', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                /* type: 'integer', */
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: SIPGenSettings.bindport
                        })(
                            <Input min={1} max={65535} maxLength="6" />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1760" /> }>
                                    <span>{ formatMessage({id: "LANG1759"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('bindaddr', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.ipAddress(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: SIPGenSettings.bindaddr
                        })(
                            <Input maxLength="40" />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5124" /> }>
                                    <span>{ formatMessage({id: "LANG5123"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('bindaddr6', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.ipv6(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: SIPGenSettings.bindaddr6
                        })(
                            <Input maxLength="44" />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1746" /> }>
                                    <span>{ formatMessage({id: "LANG1745"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('allowguest', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: SIPGenSettings.allowguest
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1748" /> }>
                                    <span>{ formatMessage({id: "LANG1747"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('allowtransfer', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: SIPGenSettings.allowtransfer
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1762" /> }>
                                    <span>{ formatMessage({id: "LANG1761"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('mwi_from', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.alphanumeric(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: SIPGenSettings.mwi_from
                        })(
                            <Input maxLength="30" />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4579" /> }>
                                    <span>{ formatMessage({id: "LANG4578"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('enable_diversion', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: SIPGenSettings.enable_diversion
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default injectIntl(General)

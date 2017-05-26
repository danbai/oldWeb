'use strict'

import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select, Tabs } from 'antd'
const FormItem = Form.Item
import _ from 'underscore'
import Validator from "../../api/validator"
import UCMGUI from "../../api/ucmgui"

class Misc extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {

    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        let sipMiscSettings = this.props.dataSource
        
        return (
            <div className="content">
                <Form>
                    <div className="section-title">
                        <span>{ formatMessage({id: "LANG699"}) }</span>
                    </div>
                    <div className="section-body row-section-content">
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1894" /> }>
                                        <span>{ formatMessage({id: "LANG1893"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('registertimeout', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 10, 100)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: sipMiscSettings.registertimeout
                            })(
                                <Input maxLength="3" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1891"}) }>
                                        {formatMessage({id: "LANG1890"})}
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('registerattempts', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 10)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: sipMiscSettings.registerattempts
                            })(
                                <Input maxLength="2" />
                            )}
                        </FormItem>
                    </div>
                    <div className="section-title">
                        <span>{ formatMessage({id: "LANG700"}) }</span>
                    </div>
                    <div className="section-body row-section-content">
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ formatMessage({id: "LANG1887"}) }>
                                    {formatMessage({id: "LANG1886"})}
                                </Tooltip>
                            }>
                            { getFieldDecorator('maxcallbitrate', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 65536)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: sipMiscSettings.maxcallbitrate
                            })(
                                <Input maxLength="5" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1899" /> }>
                                        <span>{ formatMessage({id: "LANG1898"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('videosupport', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: sipMiscSettings.videosupport
                            })(
                                <Checkbox />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1897" /> }>
                                        <span>{ formatMessage({id: "LANG1896"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('alwaysauthreject', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: sipMiscSettings.alwaysauthreject
                            })(
                                <Checkbox />
                            )}
                        </FormItem>
                    </div>
                    <div className="section-title">
                        <span>{ formatMessage({id: "LANG4550"}) }</span>
                    </div>
                    <div className="section-body row-section-content">
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4551" /> }>
                                        <span>{ formatMessage({id: "LANG4552"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('attr_passthrough', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: sipMiscSettings.attr_passthrough
                            })(
                                <Checkbox />
                            )}
                        </FormItem>
                    </div>
                    <div className="section-title">
                        <span>{ formatMessage({id: "LANG4774"}) }</span>
                    </div>
                    <div className="section-body row-section-content">
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4775" /> }>
                                        <span>{ formatMessage({id: "LANG4776"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('use_final_sdp', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: sipMiscSettings.use_final_sdp
                            })(
                                <Checkbox />
                            )}
                        </FormItem>
                    </div>
                    <div className="section-title hidden">
                        <span>{ formatMessage({id: "LANG5041"}) }</span>
                    </div>
                    <div className="section-body row-section-content hidden">
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG5042" /> }>
                                        <span>{ formatMessage({id: "LANG5043"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('rtp_proxy', {
                                rules: [],
                                initialValue: sipMiscSettings.rtp_proxy
                            })(
                                <Input type="text" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1889" /> }>
                                        <span>{ formatMessage({id: "LANG1888"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('g726nonstandard', {
                                rules: [],
                                initialValue: sipMiscSettings.g726nonstandard
                            })(
                                <Input type="text" />
                            )}
                        </FormItem>
                    </div>

                    <div className="section-title">
                        <span>{ formatMessage({id: "LANG1214"}) }</span>
                    </div>
                    <Row className="row-section-content">
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG5594" /> }>
                                        <span>{ formatMessage({id: "LANG5593"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('allow_blind_transfer_callback', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: sipMiscSettings.allow_blind_transfer_callback
                            })(
                                <Checkbox />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG5596" /> }>
                                        <span>{ formatMessage({id: "LANG5595"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('blind_transfer_timeout', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1, 60)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: sipMiscSettings.blind_transfer_timeout ? sipMiscSettings.blind_transfer_timeout : '60'
                            })(
                                <Input maxLength="5" />
                            )}
                        </FormItem>
                    </Row>
                </Form>
            </div>
        )
    }
}

export default Form.create()(injectIntl(Misc))

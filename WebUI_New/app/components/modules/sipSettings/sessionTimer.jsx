'use strict'

import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select } from 'antd'

import _ from 'underscore'
import UCMGUI from "../../api/ucmgui"
import Validator from "../../api/validator"
const FormItem = Form.Item

class SessionTimer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            timer: false,
            session_timers: true
        }
    }
    componentWillMount() {
        const sipSessiontimerSettings = this.props.dataSource || {}
        this.setState({
            session_timers: sipSessiontimerSettings.session_timers === "always"
        })
    }
    componentDidMount() {
    }
    componentWillUnmount() {

    }
    _onChange = (value) => {
        const { setFieldsValue } = this.props.form
        if (value.target.checked) {
            setFieldsValue({
                'timer': false
            })
        }

        this.setState({
            session_timers: value.target.checked
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const sipSessiontimerSettings = this.props.dataSource
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="content">
                <Form>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4266" /> }>
                                    <span>{ formatMessage({id: "LANG4265"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('force_timer', {
                            valuePropName: 'checked',
                            initialValue: sipSessiontimerSettings.session_timers === "always" ? true : false
                        })(
                            <Checkbox onChange={ this._onChange } />
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4268" /> }>
                                    <span>{ formatMessage({id: "LANG4267"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('timer', {
                            valuePropName: 'checked',
                            initialValue: sipSessiontimerSettings.session_timers === "yes" ? true : false
                        })(
                            <Checkbox disabled={this.state.session_timers}/>
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1872" /> }>
                                    <span>{ formatMessage({id: "LANG1871"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('session_expires', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 90, 86400)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.digits(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    let thisLabel = formatMessage({id: "LANG1871"})
                                    let otherInputLabel = formatMessage({id: "LANG1873"})
                                    let otherInputValue = form.getFieldValue('session_minse')

                                    Validator.bigger(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel)
                                }
                            }],
                            initialValue: sipSessiontimerSettings.session_expires
                        })(
                            <Input maxLength="5" />
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1874" /> }>
                                    <span>{ formatMessage({id: "LANG1873"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('session_minse', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 90, 86400)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.digits(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    let thisLabel = formatMessage({id: "LANG1873"})
                                    let otherInputLabel = formatMessage({id: "LANG1871"})
                                    let otherInputValue = form.getFieldValue('session_expires')

                                    Validator.smaller(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel)
                                }
                            }],
                            initialValue: sipSessiontimerSettings.session_minse
                        })(
                            <Input maxLength="5" />
                        )}
                    </FormItem>
                </Form>
            </div>
        )
    }
}
export default injectIntl(SessionTimer)

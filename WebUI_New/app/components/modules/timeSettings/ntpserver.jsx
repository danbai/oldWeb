'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl, formatMessage } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select } from 'antd'
import Validator from "../../api/validator"

const FormItem = Form.Item

class ChangeTime extends Component {
    constructor(props) {
        super(props)
        this.state = {
            NTPStatus: 'off'
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {

    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        let NTPStatus = this.state.NTPStatus
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'checkNTPServerStatus',
                NTPStatus: ''
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    NTPStatus = response.NTPStatus || {}
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.props.setInitNTP(NTPStatus)
        this.setState({
            NTPStatus: NTPStatus
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const email_settings = this.state.email_settings
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_enable_ntpserver"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG2533" />}>
                                    <span>{formatMessage({id: "LANG2492"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('enable_ntpserver', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: this.state.NTPStatus === 'on'
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default injectIntl(ChangeTime)

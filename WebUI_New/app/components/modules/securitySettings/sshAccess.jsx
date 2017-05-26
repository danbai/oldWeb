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

class SSHAccess extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sshStatus: '0',
            firstLoad: true
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {

    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        let sshStatus = this.state.sshStatus
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getSshStatus'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    sshStatus = response.status || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            sshStatus: sshStatus,
            firstLoad: false
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

        if (this.state.firstLoad && this.props.firstLoad) {
            this._getInitData()
        }
        if (!this.state.firstLoad && !this.props.firstLoad) {
            this.setState({
                firstLoad: true
            })
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_access"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG4181" />}>
                                    <span>{formatMessage({id: "LANG4180"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('access', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: this.state.sshStatus === "0"
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

SSHAccess.propTypes = {
}

export default injectIntl(SSHAccess)

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
import { Form, Input, message, Select, Tooltip } from 'antd'

const FormItem = Form.Item

class DahdiSettings extends Component {
    constructor(props) {
        super(props)

        this.state = {}
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        let formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 6 }
            }

        let dahdiSettings = this.props.dahdiSettings || {}

        return (
            <div className="app-content-main">
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG5630" />}>
                                    <span>{formatMessage({id: "LANG5630"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('buffers', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: dahdiSettings.buffers ? dahdiSettings.buffers : '32,half'
                            })(
                                <Select>
                                    <Option value="4,half">4,half</Option>
                                    <Option value="4,immediate">4,immediate</Option>
                                    <Option value="4,full">4,full</Option>
                                    <Option value="8,half">8,half</Option>
                                    <Option value="8,immediate">8,immediate</Option>
                                    <Option value="8,full">8,full</Option>
                                    <Option value="32,half">32,half</Option>
                                    <Option value="32,immediate">32,immediate</Option>
                                    <Option value="32,full">32,full</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG5631" />}>
                                    <span>{formatMessage({id: "LANG5631"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('faxbuffers', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: dahdiSettings.faxbuffers ? dahdiSettings.faxbuffers : '32,half'
                            })(
                                <Select>
                                    <Option value="4,half">4,half</Option>
                                    <Option value="4,immediate">4,immediate</Option>
                                    <Option value="4,full">4,full</Option>
                                    <Option value="8,half">8,half</Option>
                                    <Option value="8,immediate">8,immediate</Option>
                                    <Option value="8,full">8,full</Option>
                                    <Option value="32,half">32,half</Option>
                                    <Option value="32,immediate">32,immediate</Option>
                                    <Option value="32,full">32,full</Option>
                                </Select>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default injectIntl(DahdiSettings)
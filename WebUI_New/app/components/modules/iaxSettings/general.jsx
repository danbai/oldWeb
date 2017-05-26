'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl, formatMessage } from 'react-intl'
import { Form, Input, Button, Checkbox, Popconfirm, message, Tooltip, Select, Upload, Icon, Modal, Table, BackTop } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import _ from 'underscore'
import Validator from "../../api/validator"

const FormItem = Form.Item
const Option = Select.Option
class General extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mohNameList: []
        }
    }
    componentDidMount () {
        this._getInitData()
    }
    _getInitData = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getMohNameList'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let list = data.response.moh_name

                if (list && list.length > 0) {
                    this.setState({
                        mohNameList: list
                    })
                }
            }.bind(this)
        })
    }

    render() {
        const {formatMessage} = this.props.intl
        const { getFieldDecorator } = this.props.form
        let IAXGenSettings = this.props.IAXGenSettings
        let mohNameList = this.state.mohNameList

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
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1628" /> }>
                                    <span>{ formatMessage({id: "LANG1627"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('bindport', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.digits(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 1, 65535)
                                }
                            }],
                            initialValue: IAXGenSettings.bindport
                        })(
                            <Input min={1} max={65535} maxLength="6" />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1626" /> }>
                                    <span>{ formatMessage({id: "LANG1625"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('bindaddr', {
                            getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{ 
                                    validator: (data, value, callback) => {
                                        Validator.ipAddress(data, value, callback, formatMessage)
                                    }
                                }],
                            initialValue: IAXGenSettings.bindaddr
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
                                    validator: (data, value, callback) => {
                                        Validator.ipv6(data, value, callback, formatMessage)
                                    }
                                }],
                            initialValue: IAXGenSettings.bindaddr6
                        })(
                            <Input maxLength="44" />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1632" /> }>
                                    <span>{ formatMessage({id: "LANG1631"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('iaxcompat', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: IAXGenSettings.iaxcompat === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1639" /> }>
                                    <span>{ formatMessage({id: "LANG1638"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('nochecksums', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: IAXGenSettings.nochecksums === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1630" /> }>
                                    <span>{ formatMessage({id: "LANG1629"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('delayreject', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: IAXGenSettings.delayreject === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1622" /> }>
                                    <span>ADSI:</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('adsi', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: IAXGenSettings.adsi === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1635" /> }>
                                    <span>{ formatMessage({id: "LANG1634"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('mohinterpret', {
                            initialValue: IAXGenSettings.mohinterpret
                        })(
                            <Select>
                                {
                                    mohNameList.map(function(value, index) {
                                        return <Option value={ value } key={ index }>{ value }</Option>
                                    })
                                }
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1635" /> }>
                                    <span>{ formatMessage({id: "LANG1634"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('mohsuggest', {
                            initialValue: IAXGenSettings.mohsuggest
                        })(
                            <Select>
                                {
                                    mohNameList.map(function(value, index) {
                                        return <Option value={ value } key={ index }>{ value }</Option>
                                    })
                                }
                            </Select>
                        ) }
                    </FormItem>
                    <div className="hidden">
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1633" /> }>
                                        <span>{ formatMessage({id: "LANG1458"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('language', {
                                initialValue: IAXGenSettings.language
                            })(
                                <Select>
                                    {

                                    }
                                </Select>
                            ) }
                        </FormItem>
                    </div>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1624" /> }>
                                    <span>{ formatMessage({id: "LANG1623"}) }</span>
                                </Tooltip>
                            </span>
                        )}>
                        { getFieldDecorator('bandwidth', {
                            rules: [],
                            initialValue: IAXGenSettings.bandwidth
                        })(
                            <Select style={{ width: 200 }}>
                                <Option value='low'>{formatMessage({id: "LANG1640"})}</Option>
                                <Option value='medium'>{formatMessage({id: "LANG1641"})}</Option>
                                <Option value='high'>{formatMessage({id: "LANG1642"})}</Option>
                            </Select>
                        ) }
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default injectIntl(General)

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
class Reg extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount () {
    }
    _checkAutokill = (data, val, callback, formatMessage) => {
        let key = val.toLowerCase()

        if (key && key !== "yes" && key !== "no" && !(/^([1-9]|([1-9]\d+))$/.test(key))) {
            callback(formatMessage({id: "LANG2212"}))
        } else {
            callback()
        }
    }
    render() {
        const {formatMessage} = this.props.intl
        const { getFieldDecorator } = this.props.form
        let IAXRegSettings = this.props.IAXRegSettings
        let form = this.props.form
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="content">
                <Form>
                    <div className="section-title">
                        <span>{ formatMessage({id: "LANG681"}) }</span>
                    </div>
                    <div className="section-body row-section-content">
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1662" /> }>
                                        <span>{ formatMessage({id: "LANG1661"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('minregexpire', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 65535)
                                    }
                                }],
                                initialValue: IAXRegSettings.minregexpire
                            })(
                                <Input min={0} max={65535} maxLength="6" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1664"}) }>
                                        {formatMessage({id: "LANG1663"})}
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('maxregexpire', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 65535)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        let thisLabel = formatMessage({id: "LANG1663"})
                                        let otherInputValue = form.getFieldValue("minregexpire")
                                        let otherInputLabel = formatMessage({id: "LANG1661"})
                                        Validator.bigger(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel)
                                    }
                                }],
                                initialValue: IAXRegSettings.maxregexpire
                            })(
                                <Input min={0} max={65535} maxLength="6" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ formatMessage({id: "LANG1666"}) }>
                                    {formatMessage({id: "LANG1665"})}
                                </Tooltip>
                            }>
                            { getFieldDecorator('iaxthreadcount', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 65535)
                                    }
                                }],
                                initialValue: IAXRegSettings.iaxthreadcount
                            })(
                                <Input min={0} max={65535} maxLength="6" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ formatMessage({id: "LANG1668"}) }>
                                    {formatMessage({id: "LANG1667"})}
                                </Tooltip>
                            }>
                            { getFieldDecorator('iaxmaxthreadcount', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 65535)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        let thisLabel = formatMessage({id: "LANG1667"})
                                        let otherInputValue = form.getFieldValue("iaxthreadcount")
                                        let otherInputLabel = formatMessage({id: "LANG1665"})
                                        Validator.bigger(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel)
                                    }
                                }],
                                initialValue: IAXRegSettings.iaxmaxthreadcount
                            })(
                                <Input min={0} max={65535} maxLength="6" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ formatMessage({id: "LANG1670"}) }>
                                    {formatMessage({id: "LANG1669"})}
                                </Tooltip>
                            }>
                            { getFieldDecorator('autokill', {
                                rules: [{
                                    validator: (data, value, callback) => {
                                        this._checkAutokill(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: IAXRegSettings.autokill
                            })(
                                <Input maxLength="6" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1672" /> }>
                                        <span>{ formatMessage({id: "LANG1671"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('authdebug', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: IAXRegSettings.authdebug === "yes" ? true : false
                            })(
                                <Checkbox />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1674" /> }>
                                        <span>{ formatMessage({id: "LANG1673"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('codecpriority', {
                                rules: [],
                                initialValue: IAXRegSettings.codecpriority
                            })(
                                <Select style={{ width: 200 }}>
                                    <Option value='caller'>{formatMessage({id: "LANG75"})}</Option>
                                    <Option value='disabled'>{formatMessage({id: "LANG76"})}</Option>
                                    <Option value='reqonly'>{formatMessage({id: "LANG77"})}</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1676" /> }>
                                        <span>{ formatMessage({id: "LANG1675"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('tos', {
                                rules: [],
                                initialValue: IAXRegSettings.tos
                            })(
                                <Select style={{ width: 200 }}>
                                    <option value='ef'>EF</option>
                                    <option value='cs0'>CS0</option>
                                    <option value='cs1'>CS1</option>
                                    <option value='cs2'>CS2</option>
                                    <option value='cs3'>CS3</option>
                                    <option value='cs4'>CS4</option>
                                    <option value='cs5'>CS5</option>
                                    <option value='cs6'>CS6</option>
                                    <option value='cs7'>CS7</option>
                                    <option value='af11'>AF11</option>
                                    <option value='af12'>AF12</option>
                                    <option value='af13'>AF13</option>
                                    <option value='af21'>AF21</option>
                                    <option value='af22'>AF22</option>
                                    <option value='af23'>AF23</option>
                                    <option value='af31'>AF31</option>
                                    <option value='af32'>AF32</option>
                                    <option value='af33'>AF33</option>
                                    <option value='af41'>AF41</option>
                                    <option value='af42'>AF42</option>
                                    <option value='af43'>AF43</option>
                                </Select>
                            ) }
                        </FormItem>
                    </div>
                    <div className="section-title">
                        <span>{ formatMessage({id: "LANG682"}) }</span>
                    </div>
                    <div className="section-body row-section-content">
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ formatMessage({id: "LANG1678"}) }>
                                    {formatMessage({id: "LANG1677"})}
                                </Tooltip>
                            }>
                            { getFieldDecorator('trunkfreq', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 65535)
                                    }
                                }],
                                initialValue: IAXRegSettings.trunkfreq
                            })(
                                <Input min={0} max={65535} maxLength="6" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1680" /> }>
                                        <span>{ formatMessage({id: "LANG1679"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('trunktimestamps', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: IAXRegSettings.trunktimestamps === "yes" ? true : false
                            })(
                                <Checkbox />
                            )}
                        </FormItem>
                    </div>
                </Form>
            </div>
        )
    }
}
export default injectIntl(Reg)

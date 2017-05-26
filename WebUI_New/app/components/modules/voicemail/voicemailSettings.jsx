'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, Checkbox, Form, Input, message, Tooltip, Select } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

const FormItem = Form.Item
const Option = Select.Option

class Voicemail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            operator: false,
            accountList: [],
            prefSettings: {},
            voicemailSettings: {}
        }
    }
    componentDidMount() {
        this._getAccountList()
        this._getVMSettings()
    }
    _emailSettings() {
        browserHistory.push('/call-features/voicemail/voicemailEmailSettings/email')
    }
    _getAccountList = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getAccountList' },
            type: 'json',
            async: false,
            success: function(res) {
                let response = res.response || {}

                this.setState({
                    accountList: response.extension || []
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getVMSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getVMSettings' },
            type: 'json',
            async: false,
            success: function(res) {
                let response = res.response || {}
                let voicemail_settings = response.voicemail_settings || {}

                console.log('get voicemail values is ', voicemail_settings)
                this.setState({
                    voicemailSettings: voicemail_settings,
                    operator: (voicemail_settings.operator === 'yes'),
                    prefSettings: response.general_pref_settings || {}
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _onEnableChange = (e) => {
        this.setState({
            operator: e.target.checked
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        const disabled = formatMessage({id: "LANG273"})
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        let voicemailSettings = this.state.voicemailSettings || {}
        let maxgreet = voicemailSettings.maxgreet
        let operator_exten = this.state.prefSettings.operator ? this.state.prefSettings.operator : ''
        let maxmsg = voicemailSettings.maxmsg
        let maxsecs = voicemailSettings.maxsecs + ''
        let minsecs = voicemailSettings.minsecs + ''
        let saycid = (voicemailSettings.saycid === 'yes')
        let sayduration = (voicemailSettings.sayduration === 'yes')
        let envelope = (voicemailSettings.envelope === 'yes')
        let en_reverse = (voicemailSettings.en_reverse === 'yes')
        let review = (voicemailSettings.review === 'yes')

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG651"})})

        return (
            <div className="app-content-main">
                <div className="content">
                    <div className="top-button">
                        <Button type="primary" icon="" onClick={ this._emailSettings } >
                            { formatMessage({id: "LANG767"}) }
                        </Button>
                    </div>
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1494"}) }>
                                        <span>{ formatMessage({id: "LANG1493"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('maxgreet', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 60, 600)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: maxgreet
                            })(
                                <Input maxLength={4} />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1492"}) }>
                                        <span>{ formatMessage({id: "LANG1491"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('operator', {
                                valuePropName: 'checked',
                                initialValue: this.state.operator
                            })(
                                <Checkbox onChange={ this._onEnableChange } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1595"}) }>
                                        <span>{ formatMessage({id: "LANG1594"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('operator_exten', {
                                initialValue: operator_exten
                            })(
                                <Select disabled={ !this.state.operator }>
                                    <Option key={ '' } value={ '' }>
                                        { formatMessage({id: "LANG133"}) }
                                    </Option>
                                    {
                                        this.state.accountList.map(function(item) {
                                            return <Option
                                                        key={ item.extension }
                                                        value={ item.extension }
                                                        className={ item.out_of_service === 'yes' ? 'out-of-service' : '' }
                                                    >
                                                        {
                                                            (item.extension +
                                                            (item.fullname ? ' "' + item.fullname + '"' : '') +
                                                            (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                                                        }
                                                    </Option>
                                            }
                                        )
                                    }
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1496"}) }>
                                        <span>{ formatMessage({id: "LANG1495"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('maxmsg', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 10, 1000)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: maxmsg
                            })(
                                <Input maxLength={4} />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1498"}) }>
                                        <span>{ formatMessage({id: "LANG1497"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('maxsecs', {
                                initialValue: maxsecs
                            })(
                                <Select>
                                    <Option key="60" value="60">{ formatMessage({id: "LANG1513"}) }</Option>
                                    <Option key="120" value="120">{ formatMessage({id: "LANG1514"}) }</Option>
                                    <Option key="300" value="300">{ formatMessage({id: "LANG1515"}) }</Option>
                                    <Option key="900" value="900">{ formatMessage({id: "LANG1516"}) }</Option>
                                    <Option key="1800" value="1800">{ formatMessage({id: "LANG1517"}) }</Option>
                                    <Option key="0" value="0">{ formatMessage({id: "LANG1518"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1500"}) }>
                                        <span>{ formatMessage({id: "LANG1499"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('minsecs', {
                                initialValue: minsecs
                            })(
                                <Select>
                                    <Option key="0" value="0">{ formatMessage({id: "LANG1507"}) }</Option>
                                    <Option key="1" value="1">{ formatMessage({id: "LANG1508"}) }</Option>
                                    <Option key="2" value="2">{ formatMessage({id: "LANG1509"}) }</Option>
                                    <Option key="3" value="3">{ formatMessage({id: "LANG1510"}) }</Option>
                                    <Option key="4" value="4">{ formatMessage({id: "LANG1511"}) }</Option>
                                    <Option key="5" value="5">{ formatMessage({id: "LANG1512"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1504"}) }>
                                        <span>{ formatMessage({id: "LANG1503"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('saycid', {
                                valuePropName: 'checked',
                                initialValue: saycid
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1506"}) }>
                                        <span>{ formatMessage({id: "LANG1505"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('sayduration', {
                                valuePropName: 'checked',
                                initialValue: sayduration
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1502"}) }>
                                        <span>{ formatMessage({id: "LANG1501"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('envelope', {
                                valuePropName: 'checked',
                                initialValue: envelope
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG4061"}) }>
                                        <span>{ formatMessage({id: "LANG4060"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('en_reverse', {
                                valuePropName: 'checked',
                                initialValue: en_reverse
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG1490"}) }>
                                        <span>{ formatMessage({id: "LANG1489"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('review', {
                                valuePropName: 'checked',
                                initialValue: review
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

export default injectIntl(Voicemail)
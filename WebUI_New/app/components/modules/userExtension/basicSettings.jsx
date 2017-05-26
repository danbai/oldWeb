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
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class BasicSettings extends Component {
    constructor(props) {
        super(props)

        this.state = {
            hasvoicemail: this.props.settings.hasvoicemail === 'yes' ? true : false,
            enable_qualify: this.props.settings.enable_qualify === 'yes' ? true : false
        }
    }
    componentDidMount() {
    }
    componentWillMount() {
    }
    _checkPrivilege = (params) => {
        let result = false
        let settingsPrivilege = this.props.settingsPrivilege
        // let userSettingsPrivilege = this.props.userSettingsPrivilege

        if (!params) {
            return false
        }

        if (settingsPrivilege.hasOwnProperty(params) &&
            (settingsPrivilege[params] === 3 || settingsPrivilege[params] === 15)) {
            result = true
        }

        // if (userSettingsPrivilege.hasOwnProperty(params) &&
        //     (userSettingsPrivilege[params] === 3 || userSettingsPrivilege[params] === 15)) {
        //     result = true
        // }

        return result
    }
    _onChangeHasVoicemail = (e) => {
        this.setState({
            hasvoicemail: e.target.checked
        })
    }
    _onChangeQualify = (e) => {
        this.setState({
            enable_qualify: e.target.checked
        })
    }
    _onFocus = (e) => {
        e.preventDefault()

        const form = this.props.form

        form.validateFields([e.target.id], { force: true })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        const settings = this.props.settings || {}
        const currentEditId = this.props.currentEditId
        const extension_type = this.props.extensionType
        const userSettings = this.props.userSettings || {}

        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        const formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="content">
                <div className="ant-form">
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG625"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1064" /> }>
                                            <span>{ formatMessage({id: "LANG85"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('extension', {
                                    rules: [
                                        {
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }
                                    ],
                                    initialValue: settings.extension
                                })(
                                    <Input disabled={ !!currentEditId } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('dahdi') && extension_type === 'fxs' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1092" /> }>
                                            <span>{ formatMessage({id: "LANG1091"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('dahdi', {
                                    rules: [
                                        {
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }
                                    ],
                                    initialValue: settings.dahdi ? settings.dahdi + '' : '1',
                                    className: this._checkPrivilege('dahdi') && extension_type === 'fxs' ? 'display-block' : 'hidden'
                                })(
                                    <Select>
                                        <Option value='1'>{ 'FXS 1' }</Option>
                                        <Option value='2'>{ 'FXS 2' }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('cidnumber') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1068" /> }>
                                            <span>{ formatMessage({id: "LANG1067"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('cidnumber', {
                                    rules: [],
                                    initialValue: settings.cidnumber,
                                    className: this._checkPrivilege('cidnumber') ? 'display-block' : 'hidden'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('permission') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1070" /> }>
                                            <span>{ formatMessage({id: "LANG1069"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('permission', {
                                    rules: [
                                        {
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }
                                    ],
                                    initialValue: settings.permission ? settings.permission : 'internal',
                                    className: this._checkPrivilege('permission') ? 'display-block' : 'hidden'
                                })(
                                    <Select>
                                        <Option value='internal'>{ formatMessage({id: 'LANG1071'}) }</Option>
                                        <Option value='internal-local'>{ formatMessage({id: 'LANG1072'}) }</Option>
                                        <Option value='internal-local-national'>{ formatMessage({id: 'LANG1073'}) }</Option>
                                        <Option value='internal-local-national-international'>{ formatMessage({id: 'LANG1074'}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('secret') && extension_type !== 'fxs' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1076" /> }>
                                            <span>{ formatMessage({id: "LANG1075"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('secret', {
                                    rules: [
                                        {
                                            required: (extension_type !== 'fxs'),
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                extension_type !== 'fxs' ? Validator.checkAlphanumericPw(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                extension_type !== 'fxs' ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                            }
                                        }
                                    ],
                                    initialValue: settings.secret,
                                    className: this._checkPrivilege('secret') && extension_type !== 'fxs' ? 'display-block' : 'hidden'
                                })(
                                    <Input maxLength={32} />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('authid') && extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2488" /> }>
                                            <span>{ formatMessage({id: "LANG2487"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('authid', {
                                    rules: [],
                                    initialValue: settings.authid,
                                    className: this._checkPrivilege('authid') && extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('hasvoicemail') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1078" /> }>
                                            <span>{ formatMessage({id: "LANG1077"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('hasvoicemail', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.hasvoicemail,
                                    className: this._checkPrivilege('hasvoicemail') ? 'display-block' : 'hidden'
                                })(
                                    <Checkbox onChange={ this._onChangeHasVoicemail } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('vmsecret') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1080" /> }>
                                            <span>{ formatMessage({id: "LANG1079"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('vmsecret', {
                                    rules: [
                                        {
                                            required: this.state.hasvoicemail,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.hasvoicemail ? Validator.checkNumericPw(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.hasvoicemail ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                            }
                                        }
                                    ],
                                    initialValue: settings.vmsecret,
                                    className: this._checkPrivilege('vmsecret') ? 'display-block' : 'hidden'
                                })(
                                    <Input maxLength={32} disabled={ !this.state.hasvoicemail } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('skip_vmsecret') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2686" /> }>
                                            <span>{ formatMessage({id: "LANG2685"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('skip_vmsecret', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.skip_vmsecret === 'yes',
                                    className: this._checkPrivilege('skip_vmsecret') ? 'display-block' : 'hidden'
                                })(
                                    <Checkbox disabled={ !this.state.hasvoicemail } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('enable_qualify') && extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1106" /> }>
                                            <span>{ formatMessage({id: "LANG1105"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('enable_qualify', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_qualify,
                                    className: this._checkPrivilege('enable_qualify') && extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Checkbox onChange={ this._onChangeQualify } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('qualifyfreq') && extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1108" /> }>
                                            <span>{ formatMessage({id: "LANG1107"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('qualifyfreq', {
                                    rules: [
                                        {
                                            // type: 'integer',
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }
                                    ],
                                    initialValue: settings.qualifyfreq ? settings.qualifyfreq + '' : '60',
                                    className: this._checkPrivilege('qualifyfreq') && extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Input disabled={ !this.state.enable_qualify } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2756" /> }>
                                            <span>{ formatMessage({id: "LANG2755"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('out_of_service', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.out_of_service === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('first_name') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2848" /> }>
                                            <span>{ formatMessage({id: "LANG2817"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('first_name', {
                                    rules: [],
                                    initialValue: userSettings.first_name,
                                    className: this._checkPrivilege('first_name') ? 'display-block' : 'hidden'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('last_name') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2849" /> }>
                                            <span>{ formatMessage({id: "LANG2813"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('last_name', {
                                    rules: [],
                                    initialValue: userSettings.last_name,
                                    className: this._checkPrivilege('last_name') ? 'display-block' : 'hidden'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('email') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1082" /> }>
                                            <span>{ formatMessage({id: "LANG1081"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('email', {
                                    rules: [],
                                    initialValue: userSettings.email,
                                    className: this._checkPrivilege('email') ? 'display-block' : 'hidden'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('user_password') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2845" /> }>
                                            <span>{ formatMessage({id: "LANG2810"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('user_password', {
                                    rules: [
                                        {
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.checkAlphanumericPw(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.maxlength(data, value, callback, formatMessage, 32)
                                            }
                                        }
                                    ],
                                    initialValue: userSettings.user_password,
                                    className: this._checkPrivilege('user_password') ? 'display-block' : 'hidden'
                                })(
                                    <Input maxLength={32} />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2545" /> }>
                                            <span>{ formatMessage({id: "LANG31"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('language', {
                                    rules: [
                                        {
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }
                                    ],
                                    initialValue: userSettings.language ? userSettings.language : 'default'
                                })(
                                    <Select>
                                        <Option value='default'>{ formatMessage({id: "LANG257"}) }</Option>
                                        {
                                            this.props.languages.map(function(item) {
                                                return <Option
                                                            key={ item.language_id }
                                                            value={ item.language_id }
                                                        >
                                                            { item.language_name }
                                                        </Option>
                                            })
                                        }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('max_contacts') && extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4223" /> }>
                                            <span>{ formatMessage({id: "LANG4222"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('max_contacts', {
                                    rules: [
                                        {
                                            // type: 'integer',
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }
                                    ],
                                    initialValue: settings.max_contacts ? settings.max_contacts + '' : '1',
                                    className: this._checkPrivilege('max_contacts') && extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this._checkPrivilege('phone_number') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2851" /> }>
                                            <span>{ formatMessage({id: "LANG2815"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('phone_number', {
                                    rules: [],
                                    initialValue: userSettings.phone_number,
                                    className: this._checkPrivilege('phone_number') ? 'display-block' : 'hidden'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default injectIntl(BasicSettings)
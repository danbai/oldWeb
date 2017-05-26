'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Form, Input, Modal, Button, Row, Col, Checkbox, message, Select, Tabs, Spin } from 'antd'
import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import Validator from "../../api/validator"
import Title from '../../../views/title'
import UCMGUI from "../../api/ucmgui"

const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost

class LdapClientConf extends Component {
    constructor(props) {
        super(props)
        this.state = {
            LDAPClientConfig: {}
        }
        this._handleSubmit = (e) => {
            const { formatMessage } = this.props.intl
            const form = this.props.form

            this.props.form.validateFieldsAndScroll((err, values) => {
                let me = this
                let refs = this.refs,
                    action = {}
                action = values
                for (let key in values) {
                    if (values.hasOwnProperty(key)) {
                        let divKey = refs["div_" + key]
                        if (divKey && 
                           divKey.props &&
                            ((divKey.props.className &&
                            divKey.props.className.indexOf("hidden") === -1) ||
                            typeof divKey.props.className === "undefined")) {
                            if (!err || (err && typeof err[key] === "undefined")) {
                                action[key] = UCMGUI.transCheckboxVal(values[key])   
                            } else {
                                return
                            }
                        } else if (typeof divKey === "undefined") {
                            if (!err || (err && typeof err[key] === "undefined")) {
                                action[key] = UCMGUI.transCheckboxVal(values[key])   
                            } else {
                                return
                            }
                        }
                    }
                }
                message.loading(formatMessage({ id: "LANG904" }), 0)
                action["action"] = "updateLDAPClientConfig"
                let ldapServerAddress = action["ldap_server_address"]
                if (UCMGUI.isIPv6NoPort(ldapServerAddress)) {
                    action["ldap_server_address"] = "[" + ldapServerAddress + "]"
                }

                $.ajax({
                    type: "post",
                    url: baseServerURl,
                    data: action,
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        message.destroy()
                        message.error(errorThrown)
                    },
                    success: function(data) {
                        let bool = UCMGUI.errorHandler(data, null, this.props.formatMessage)

                        if (bool) {
                            $.ajax({
                                type: 'GET',
                                url: baseServerURl + 'action=runLDAPClient&runldapclient',
                                error: function(jqXHR, textStatus, errorThrown) {
                                    message.error(errorThrown)
                                }, 
                                success: function(data) {
                                    let bool = UCMGUI.errorHandler(data, null, this.props.formatMessage),
                                        sRes = data.response.runldapclient,
                                        sError

                                    message.destroy()
                                    if (bool) {
                                        if (sRes === "") {
                                            message.success(formatMessage({ id: "LANG844" }))
                                        } else {
                                            switch (sRes) {
                                                case "-1":
                                                    sError = "LANG4121"
                                                    break
                                                case "-2":
                                                    sError = "LANG4122"
                                                    break
                                                case "-3":
                                                    sError = "LANG2969"
                                                    break
                                                case "-4":
                                                    sError = "LANG4123"
                                                    break
                                                default:
                                                    sError = "LANG909"
                                            }
                                            message.error(formatMessage({id: sError}))
                                        }
                                    }
                                }.bind(this)
                            })
                        }
                    }.bind(this)
                })
            })
        }
        this._handleCancel = (e) => {
            browserHistory.push({
                pathname: '/system-settings/ldapServer/ldapPhonebook/'
            })
        }
    }
    componentDidMount() {
        this._createClient()
    }
    _createClient = () => {
        $.ajax({
            type: "GET",
            url: baseServerURl + "action=getLDAPClientConfig",
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let oData = data.response
                    this.setState({
                        LDAPClientConfig: oData
                    })
                }
            }.bind(this)
        })
    }
    _validLdapServerName = (data, val, callback, formatMessage) => {
        if (val === "pbx") {
            callback(formatMessage({id: "LANG4198"}))
        } else {
            callback()
        }
    }
    _validLdapChars = (data, val, callback, formatMessage, msg) => {
        if (val && !val.match(/^[a-zA-Z0-9=,_]+$/)) {
            callback(formatMessage({id: "LANG2014"}, {0: msg}))
        } else {
            callback()
        }
    }
    _validDn = (data, val, callback, formatMessage) => {
        if (val && !val.match(/^([a-z]+=[a-z0-9_]+,)*([a-z]+=[a-z0-9_]+)$/i)) {
            callback(formatMessage({id: "LANG2017"}))
        } else {
            callback()
        }
    }
    _validAttr = (data, val, callback, formatMessage) => {
        var pos_eq = 0,
            pos_com = 0,
            str = val
        let res = true
        let msg = ""

        while ((pos_eq = str.indexOf("=")) >= 0) {
            if (!str.match(/^(st|stateorprovincename|street|streetaddress|l|localityname|c|countryname|o|organizationname|ou|organizationalunitname|cn|commonname|dc|domaincomponent|uid|userid)=/i)) {
                var attrname = str.substring(0, pos_eq)

                msg = formatMessage({id: "LANG2018"}) + ' : ' + attrname

                res = false
                break
            }

            pos_com = str.indexOf(",")

            if (pos_com < 0) {
                break
            }

            str = str.substring(pos_com + 1)
        }

        if (!res) {
            callback(msg)
        } else {
            callback()
        }
    }
    _validClientLdapChars = (data, val, callback, formatMessage, msg) => {
        let res = true

        if (val && !val.match(/^[a-zA-Z0-9=,_]+$/)) {
            res = false
        }
        if (!res) {
            callback(formatMessage({id: "LANG2014"}, {0: msg}))
        } else {
            callback()
        }
    }
    _validClientDn = (data, val, callback, formatMessage) => {
        let res = true

        if (val && !val.match(/^([a-z]+=[a-z0-9_]+,)*([a-z]+=[a-z0-9_]+)$/i)) {
            res = false
        }
        if (!res) {
            callback(formatMessage({id: "LANG2017"}))
        } else {
            callback()
        }
    }
    _validClientFilter = (data, val, callback, formatMessage) => {
        let res = true

        if (val && !/^\(.+\)$/.test(val)) {
            res = false
        }
        if (!res) {
            callback(formatMessage({id: "LANG2969"}))
        } else {
            callback()
        }
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        let LDAPClientConfig = this.state.LDAPClientConfig
        return (
            <div className="app-content-main" id="app-content-main">
                <Title 
                    headerTitle={ formatMessage({id: "LANG713"}) } 
                    onSubmit={ this._handleSubmit } 
                    onCancel={ this._handleCancel }
                    isDisplay="display-block" 
                />
                <div className="content">
                    <Form>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG56"}) }>
                                    { getFieldDecorator('ldap_server_name', {
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
                                        }, {
                                            validator: (data, value, callback) => {
                                               this._validLdapServerName(data, value, callback, formatMessage)
                                            }
                                        }],
                                        initialValue: LDAPClientConfig.ldap_server_name || ""
                                    })(
                                        <Input placeholder="LdapClient" />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG2444"}) }>
                                    { getFieldDecorator('ldap_server_address', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{ 
                                            required: true, 
                                            message: formatMessage({id: "LANG2150"}) 
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.hostWithoutPort(data, value, callback, formatMessage, formatMessage({id: "LANG1373"}).toLowerCase())
                                            }
                                        }],
                                        initialValue: LDAPClientConfig.ldap_server_address || ""
                                    })(
                                        <Input placeholder="192.168.1.1" />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG1999"}) }>
                                    { getFieldDecorator('ldap_base', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{ 
                                            required: true, 
                                            message: formatMessage({id: "LANG2150"}) 
                                        }, {
                                            validator: (data, value, callback) => {
                                                this._validLdapChars(data, value, callback, formatMessage, formatMessage({id: "LANG1999"}))
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                               this._validDn(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                               this._validAttr(data, value, callback, formatMessage)
                                            }
                                        }],
                                        initialValue: LDAPClientConfig.ldap_base || ""
                                    })(
                                        <Input placeholder="dc=pbx,dc=com" />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG2446"}) }>
                                    <Input name="ldap_user" className="hidden"></Input>
                                    { getFieldDecorator('ldap_user', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                this._validClientLdapChars(data, value, callback, formatMessage, formatMessage({id: "LANG2446"}))
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                               this._validClientDn(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                               this._validAttr(data, value, callback, formatMessage)
                                            }
                                        }],
                                        initialValue: LDAPClientConfig.ldap_user || ""
                                    })(
                                        <Input placeholder="cn=admin,dc=pbx,dc=com" />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG1424"}) }>
                                    <Input type="password" name="ldap_passwd" className="hidden" />
                                    { getFieldDecorator('ldap_passwd', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                Validator.keyboradNoSpacesemicolon1(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.minlength(data, value, callback, formatMessage, 4)
                                            }
                                        }],
                                        initialValue: LDAPClientConfig.ldap_passwd || ""
                                    })(
                                        <Input type="password" placeholder="cn=admin,dc=pbx,dc=com" />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG2006"}) }>
                                    { getFieldDecorator('ldap_number_filter', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{ 
                                            required: true, 
                                            message: formatMessage({id: "LANG2150"}) 
                                        }, {
                                            validator: (data, value, callback) => {
                                               this._validClientFilter(data, value, callback, formatMessage)
                                            }
                                        }],
                                        initialValue: LDAPClientConfig.ldap_number_filter || ""
                                    })(
                                        <Input placeholder="(objectClass=*)" />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>    
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG2008"}) }>
                                    { getFieldDecorator('ldap_port', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{ 
                                            required: true, 
                                            message: formatMessage({id: "LANG2150"}) 
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.digits(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.range(data, value, callback, formatMessage, 1, 65535)
                                            }
                                        }],
                                        initialValue: LDAPClientConfig.ldap_port || ""
                                    })(
                                        <Input placeholder="389" />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                            </Col>
                        </Row>
                        <div className='section-title'>{ formatMessage({ id: "LANG715"}) }</div>
                        <div className='lite-desc'>{ formatMessage({ id: "LANG2434"}) }</div>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG1999"}) }>
                            <font>{ formatMessage({ id: "LANG2000"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2438"}) }>
                            <font>{ formatMessage({ id: "LANG2435"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG1424"}) }>
                            <font>{ formatMessage({ id: "LANG2435"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2437"}) }>
                            <font>{ formatMessage({ id: "LANG2436"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2006"}) }>
                            <font>{ formatMessage({ id: "LANG2007"}) }</font>
                        </FormItem> 
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2008"}) }>
                            <font>{ formatMessage({ id: "LANG2009"}) }</font>
                        </FormItem>
                        <div className='section-title'>{ formatMessage({ id: "LANG2455"}) }</div>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2444"}) }>
                            <font>{ formatMessage({ id: "LANG2445"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG1999"}) }>
                            <font>{ formatMessage({ id: "LANG2000"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2446"}) }>
                            <font>{ formatMessage({ id: "LANG2435"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG1424"}) }>
                            <font>{ formatMessage({ id: "LANG2435"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2456"}) }>
                            <font>{ formatMessage({ id: "LANG2457"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2458"}) }>
                            <font>{ formatMessage({ id: "LANG2459"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2447"}) }>
                            <font>{ formatMessage({ id: "LANG2448"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2449"}) }>
                            <font>{ formatMessage({ id: "LANG2450"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2451"}) }>
                            <font>{ formatMessage({ id: "LANG2452"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2453"}) }>
                            <font>{ formatMessage({ id: "LANG2454"}) }</font>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG2008"}) }>
                            <font>{ formatMessage({ id: "LANG2009"}) }</font>
                        </FormItem>                         
                    </Form>
                </div>
            </div>
        )
    }
}

module.exports = Form.create()(injectIntl(LdapClientConf))
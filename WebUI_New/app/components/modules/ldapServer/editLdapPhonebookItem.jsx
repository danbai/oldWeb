'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Modal, Button, Row, Col, Checkbox, message, Tooltip, Select, Tabs, Spin } from 'antd'
import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import Validator from "../../api/validator"
import Title from '../../../views/title'
import UCMGUI from "../../api/ucmgui"

const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost

class EditLdapPhonebookItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ldapConfigs: {},
            phonebookdn: ""
        }
        this._onChangePhonebookname = (e) => {
            const form = this.props.form
            const state = this.state

            var reg = new RegExp('=' + UCMGUI.betweenXY(state.ldapConfigs.pbxdn, '=', ',') + ','),
                phonebookname = e.target.value,
                phonebookdn = UCMGUI.rChop(state.ldapConfigs.pbxdn, state.ldapConfigs.basedn).replace(reg, '=' + phonebookname + ',') + state.ldapConfigs.basedn

            this.setState({
                phonebookdn: phonebookname ? phonebookdn : '',
                phonebookname: phonebookname
            })
        }
        this._handleSave = () => {
            const { formatMessage } = this.props.intl
            const form = this.props.form

            let action = {}

            this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
                if (!err) {
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
                    this.props.handleOk()
                    message.loading(formatMessage({ id: "LANG904" }), 0)

                    if (me.props.record.dn) {
                        action["action"] = "addContact"
                        action["phonebook_dn"] = me.props.record.dn
                    } else {
                        action["action"] = "updateContact"
                        action["ldap_contacts"] = JSON.stringify({
                            "phonebook_dn": me.props.record.phonebook_dn,
                            "accountnumber": me.props.record.accountnumber
                        })
                        action["phonebook_dn"] = me.props.record.phonebook_dn                   
                    }
                    $.ajax({
                        type: "post",
                        url: baseServerURl,
                        async: false,
                        data: action,
                        error: function(jqXHR, textStatus, errorThrown) {
                            message.destroy()
                            message.error(errorThrown)
                        },
                        success: function(data) {
                            $.ajax({
                                type: "post",
                                url: baseServerURl,
                                async: false,
                                data: {
                                    "action": "phonebookUpdate",
                                    "phonebook_update": action["phonebook_dn"]
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    message.destroy()
                                    message.error(errorThrown)
                                },
                                success: function(data) {
                                    message.destroy()
                                    this.props.listContacts()
                                    form.resetFields()
                                }.bind(this)
                            })
                        }.bind(this)
                    })
                }
            })
        }
        this._handleCancel = () => {
            const form = this.props.form
            form.resetFields()
            this.props.handleCancel()
        }
    }
    componentDidMount() {
        this._getLDAPConfig()
         this._listContacts()
    }  
    _getLDAPConfig = () => {
        $.ajax({
            type: "post",
            url: baseServerURl,
            async: false,
            data: {
                "action": "getLDAPConfig",
                "ldap_configs": null
            },
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.formatMessage)

                if (bool) {
                    if (data.response.ldap_configs) {
                        let ldapConfigs = data.response.ldap_configs[0]
                        this.setState({
                            ldapConfigs: ldapConfigs
                        })
                    }
                }
            }.bind(this)
        })        
    }
   _listContacts = () => {
        const record = this.props.record
        let action = {
            action: 'listLDAPContacts',
            phonebook_dn: record.dn
        }
        if (record.id === 1) {
            action = {
                action: 'listPBXContacts',
                pbx_contacts: null
            }
        }
        $.ajax({
            url: baseServerURl,
            method: 'post',
            data: action,
            type: 'json',
            async: true,
            success: function(res) {
                let phonebookDn = res.response.phonebook_dn

                if (record.id === 1) {
                    phonebookDn = res.response.pbx_contacts
                }

                this.setState({
                    phonebookDn: phonebookDn
                })
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _isAccountExist = (data, val, callback, formatMessage) => {
        const form = this.props.form
        let phonebookdn = this.state.phonebookDn
        let bool = true

        _.each(phonebookdn, function(conf, key) {
            if (conf.accountnumber === val) {
                bool = false
            }
        })

        if (!bool) {
            callback(formatMessage({id: "LANG2211"}))
        } else {
            callback()
        }
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const state = this.state
        const record = this.props.record
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 8 }
        }

        let isDisabled = ((record.id === 1) ? true : false)
        return (
                <Form>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2227" /> }>
                                        <span>{formatMessage({id: "LANG2222"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('accountnumber', {
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
                                           this._isAccountExist(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: record.accountnumber || ""
                                })(
                                    <Input maxLength="32" disabled={ isDisabled } />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2025" /> }>
                                        <span>{formatMessage({id: "LANG1361"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('calleridname', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 1)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.cidName(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 64)
                                        }
                                    }],
                                    initialValue: record.calleridname || ""
                                })(
                                    <Input maxLength="32" disabled={ isDisabled } />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2033" /> }>
                                        <span>{formatMessage({id: "LANG2032"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('email', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.email(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: record.email || ""
                                })(
                                    <Input maxLength="64" disabled={ isDisabled } />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2027" /> }>
                                        <span>{formatMessage({id: "LANG2026"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('firstname', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 1)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.cidName(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 32)
                                        }
                                    }],
                                    initialValue: record.firstname || ""
                                })(
                                    <Input maxLength="32" disabled={ isDisabled } />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2029" /> }>
                                        <span>{formatMessage({id: "LANG2028"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('lastname', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 1)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.cidName(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 32)
                                        }
                                    }],
                                    initialValue: record.lastname || ""
                                })(
                                    <Input maxLength="32" disabled={ isDisabled } />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2031" /> }>
                                        <span>{formatMessage({id: "LANG2030"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('department', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 1)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.cidName(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 32)
                                        }
                                    }],
                                    initialValue: record.department || ""
                                })(
                                    <Input maxLength="32" disabled={ isDisabled } />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2035" /> }>
                                        <span>{formatMessage({id: "LANG2034"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('mobilenumber', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digitsWithHyphen(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: record.mobilenumber || ""
                                })(
                                    <Input maxLength="32" disabled={ isDisabled } />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2037" /> }>
                                        <span>{formatMessage({id: "LANG2036"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('homenumber', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digitsWithHyphen(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: record.homenumber || ""
                                })(
                                    <Input maxLength="32" disabled={ isDisabled } />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2039" /> }>
                                        <span>{formatMessage({id: "LANG95"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('fax', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digitsWithHyphen(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: record.fax || ""
                                })(
                                    <Input maxLength="32" disabled={ isDisabled } />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                        </Col>
                    </Row>
                    <div className="app-ant-modal-footer">
                        <Button type="primary" onClick= { this._handleCancel }>
                            {formatMessage({id: "LANG726"})}
                        </Button>
                        <Button type="primary" onClick= { this._handleSave }>
                            {formatMessage({id: "LANG728"})}
                        </Button>
                    </div>
                </Form>
        )
    }
}

module.exports = Form.create()(injectIntl(EditLdapPhonebookItem))
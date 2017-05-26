'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
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

class LdapServerConf extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ldapConfigs: {}
        }
    }
    componentDidMount() {
        this._getLDAPConfig()
        this._getPhonebookList()
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
    _getPhonebookList = () => {
        let phonebookList = this.state.phonebookList
        $.ajax({
            type: "post",
            url: baseServerURl,
            async: false,
            data: {
                "action": "listPhonebookDn",
                "options": "id, dn"
            },
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.formatMessage)
                if (bool) {
                    phonebookList = data.response.ldap_phonebooks
                    this.setState({
                        phonebookList: phonebookList
                    })
                }
            }.bind(this)
        })
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
    _isUnderBasedn = (data, val, callback, formatMessage) => {
        const form = this.props.form
        if (val === "") {
            callback()
            return
        }
        let res = true
        let char = form.getFieldValue("basedn")
        let prefix = val.slice(0, -char.length)

        if (val.slice(-char.length) !== char) {
            res = false
        }

        if (!prefix.match(/^[a-z]+=[a-z0-9_]+,$/i)) {
            res = false
        }

        if (!res) {
            callback(formatMessage({id: "LANG2019"}))
        } else {
            callback()
        }
    }
    _isPrefixExist = (data, val, callback, formatMessage) => {
        const form = this.props.form
        let dn_list = this.state.phonebookList
        let bool = true
        if (dn_list) {
            for (var key in dn_list) {
                if (dn_list.hasOwnProperty(key) && dn_list[key].id !== 1) {
                    if (dn_list[key].dn === val) {
                        bool = false
                    }
                }
            }
        }

        if (!bool) {
            callback(formatMessage({id: "LANG2020"}))
        } else {
            callback()
        }
    }
    _isEndWithBasedn = (data, val, callback, formatMessage) => {
        const form = this.props.form
        let char = form.getFieldValue("basedn")

        if (val && val.slice(-char.length) !== char) {
            callback(formatMessage({id: "LANG2021"}))
        } else {
            callback()
        }
    }
    _checkCfm = (data, val, callback, formatMessage) => {
        const form = this.props.form
        form.validateFields(["root_passwd_cfm"], { force: true })
        return callback()
    }
    _samePw = (data, val, callback, formatMessage) => {
        const form = this.props.form
        let char = form.getFieldValue("root_passwd")

        if (val !== char) {
            callback(formatMessage({id: "LANG2015"}))
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
        const state = this.state

        if (this.props.serverLoad) {
            this._getLDAPConfig()
            this.props.setServerLoad(false)
        }

        return (
            <div className="content">
                <div className="ant-form">
                    <FormItem
                        { ...formItemLayout }
                        label={ formatMessage({id: "LANG1992"}) }>
                        { getFieldDecorator('basedn', {
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
                            initialValue: state.ldapConfigs.basedn || ""
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={ formatMessage({id: "LANG2016"}) }>
                        { getFieldDecorator('pbxdn', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{ 
                                required: true, 
                                message: formatMessage({id: "LANG2150"}) 
                            }, {
                                validator: (data, value, callback) => {
                                    this._validLdapChars(data, value, callback, formatMessage, formatMessage({id: "LANG2016"}))
                                }
                            }, {
                                validator: (data, value, callback) => {
                                   this._validDn(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                   this._validAttr(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                   this._isUnderBasedn(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                   this._isPrefixExist(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: state.ldapConfigs.pbxdn || ""
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={ formatMessage({id: "LANG1993"}) }>
                        <Input name="rootdn" className="hidden"></Input>
                        { getFieldDecorator('rootdn', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{ 
                                required: true, 
                                message: formatMessage({id: "LANG2150"}) 
                            }, {
                                validator: (data, value, callback) => {
                                    this._validLdapChars(data, value, callback, formatMessage, formatMessage({id: "LANG2001"}))
                                }
                            }, {
                                validator: (data, value, callback) => {
                                   this._validDn(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                   this._validAttr(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                   this._isEndWithBasedn(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: state.ldapConfigs.rootdn || ""
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={ formatMessage({id: "LANG1994"}) }>
                        <Input type="password" name="root_passwd" className="hidden" />
                        { getFieldDecorator('root_passwd', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{ 
                                required: true, 
                                message: formatMessage({id: "LANG2150"}) 
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.keyboradNoSpacesemicolon1(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.minlength(data, value, callback, formatMessage, 4)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.checkAlphanumericPw(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this._checkCfm(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: state.ldapConfigs.root_passwd || ""
                        })(
                            <Input type="password" />
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={ formatMessage({id: "LANG1995"}) }>
                        <Input type="password" name="root_passwd_cfm" className="hidden" />
                        { getFieldDecorator('root_passwd_cfm', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{ 
                                required: true, 
                                message: formatMessage({id: "LANG2150"}) 
                            }, {
                                validator: (data, value, callback) => {
                                    this._samePw(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: state.ldapConfigs.root_passwd || ""
                        })(
                            <Input type="password" />
                        )}
                    </FormItem>
                </div>
            </div>
        )
    }
}

module.exports = injectIntl(LdapServerConf)
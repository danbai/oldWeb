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

class CreateLdapPhonebook extends Component {
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
            
            let phonebookdn = this.state.phonebookdn

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

                    message.loading(formatMessage({ id: "LANG904" }), 0)

                    let prefix = form.getFieldValue("phonebookname")
                    action = {
                        "action": "addPhonebook",
                        "ldap_phonebooks": phonebookdn,
                        "phonebook_prefix": prefix,
                        "dn_id": null
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
                                    "action": "phonebookAdd",
                                    "phonebook_add": phonebookdn
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    message.destroy()
                                    message.error(errorThrown)
                                },
                                success: function(data) {
                                    message.destroy()

                                    this.props.listPhonebookDn()
                                    this.setState({
                                        phonebookdn: '',
                                        phonebookname: ''
                                    })

                                    form.resetFields()
                                    this.props.handleCancel()
                                }.bind(this)
                            })
                        }.bind(this)
                    })
                }
            })
        }
        this._handleCancel = () => {
            const form = this.props.form
            this.setState({
                phonebookdn: '',
                phonebookname: ''
            })
            form.resetFields()
            this.props.handleCancel()
        }
    }
    componentDidMount() {
        this._getLDAPConfig()
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
    _isPhonebookExist = (data, val, callback, formatMessage) => {
        const form = this.props.form
        let dn_list = this.props.phonebookList
        let add_dn = "ou=" + val + ",dc=pbx,dc=com"
        let bool = true
        if (dn_list) {
            for (var key in dn_list) {
                if (dn_list.hasOwnProperty(key)) {
                    var this_dn = dn_list[key].dn
                    if (this_dn === add_dn) {
                        bool = false
                    }
                }
            }
        }

        if (!bool) {
            callback(formatMessage({id: "LANG2210"}))
        } else {
            callback()
        }
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const state = this.state
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        return (
            <Form>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <Tooltip title={ <FormattedHTMLMessage id="LANG2041" /> }>
                            <span>{formatMessage({id: "LANG2040"})}</span>
                        </Tooltip>
                    )}>
                    { getFieldDecorator('phonebookname', {
                        getValueFromEvent: (e) => {
                            return UCMGUI.toggleErrorMessage(e)
                        },
                        rules: [{
                            required: true,
                            message: formatMessage({id: "LANG2150"})
                        }, {
                            validator: (data, value, callback) => {
                                Validator.alphanumericUnd(data, value, callback, formatMessage)
                            }
                        }, {
                            validator: (data, value, callback) => {
                                this._isPhonebookExist(data, value, callback, formatMessage)
                            }
                        }],
                        initialValue: state.phonebookname || ""
                    })(
                        <Input onChange={ this._onChangePhonebookname }/>
                    )}
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <Tooltip title={ <FormattedHTMLMessage id="LANG2043" /> }>
                            <span>{formatMessage({id: "LANG2042"})}</span>
                        </Tooltip>
                    )}>
                    <span> { state.phonebookdn }</span>
                </FormItem>
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

module.exports = Form.create()(injectIntl(CreateLdapPhonebook))
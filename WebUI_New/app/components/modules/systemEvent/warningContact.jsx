'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Button, message, Form, Input, Modal, Table, Tag, Tooltip, Col, Icon } from 'antd'

const FormItem = Form.Item
const confirm = Modal.confirm

class WarningContact extends Component {
    constructor(props) {
        super(props)

        this.state = {
            superList: [],
            managerList: []
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkRequire = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const enEmail = this.props.enEmail
        const manager_0 = getFieldValue('manager_0')

        const keys = getFieldValue('super_keys')

        if ((enEmail && manager_0 === "" && !value) || (keys.length > 1 && keys[0].key !== 0 && !value)) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _checkManagerRequire = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const enEmail = this.props.enEmail
        const super_0 = getFieldValue('super_0')

        const keys = getFieldValue('manager_keys')

        if ((enEmail && super_0 === "" && !value) || (keys.length > 1 && keys[0].key !== 0 && !value)) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _checkDifferenceEmail = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        if (!value) {
            callback()

            return
        }

        const super_keys = getFieldValue('super_keys')
        const manager_keys = getFieldValue('manager_keys')

        let email_list = []
        let not_different = true

        super_keys.map(function(item) {
            const field = `super_${item.key}`

            if (rule.field !== field) {
                const tmp_value = getFieldValue(field)

                if (tmp_value === value) {
                    not_different = false
                }
            }
        })

        manager_keys.map(function(item) {
            const field = `manager_${item.key}`

            if (rule.field !== field) {
                const tmp_value = getFieldValue(field)

                if (tmp_value === value) {
                    not_different = false
                }
            }
        })

        if (not_different === false) {
            callback(formatMessage({id: "LANG2624"}))
        } else {
            callback()
        }
    }
    _getInitData = () => {
        let superList = []
        let managerList = []

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'warningGetEmailSettings'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    let dataItem = response.body
                    let superListTmp = dataItem.admin_email.split(',')
                    let managerListTmp = dataItem.email.split(',')

                    for (let i = 0; i < superListTmp.length; i++) {
                        superList.push({
                            value: superListTmp[i],
                            key: i,
                            new: false
                        })
                    }

                    for (let i = 0; i < managerListTmp.length; i++) {
                        managerList.push({
                            value: managerListTmp[i],
                            key: i,
                            new: false
                        })
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            superList: superList,
            managerList: managerList
        })
    }
    _generateKeysID = (existIDs) => {
        let newID = 1
        const keyList = _.pluck(existIDs, 'key')

        if (keyList && keyList.length) {
            newID = _.find([1, 2, 3, 4, 5, 6, 7, 8, 9], function(key) {
                    return !_.contains(keyList, key)
                })
        }

        return {
                new: true,
                key: newID,
                value: ''
            }
    }
    _addSuperEmail = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        // can use data-binding to get
        const keys = form.getFieldValue('super_keys')

        if (keys.length <= 9) {
            const nextKeys = keys.concat(this._generateKeysID(keys))

            form.setFieldsValue({
                super_keys: nextKeys
            })
        } else {
            message.warning(formatMessage({id: "LANG2574"}))

            return false
        }
    }
    _addManagerEmail = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        // can use data-binding to get
        const keys = form.getFieldValue('manager_keys')

        if (keys.length <= 9) {
            const nextKeys = keys.concat(this._generateKeysID(keys))

            form.setFieldsValue({
                manager_keys: nextKeys
            })
        } else {
            message.warning(formatMessage({id: "LANG2574"}))

            return false
        }
    }
    _removeSuperEmail = (k) => {
        const { form } = this.props

        // can use data-binding to get
        const keys = form.getFieldValue('super_keys')

        form.setFieldsValue({
            super_keys: keys.filter(key => key !== k)
        })
    }
    _removeManagerEmail = (k) => {
        const { form } = this.props

        // can use data-binding to get
        const keys = form.getFieldValue('manager_keys')

        form.setFieldsValue({
            manager_keys: keys.filter(key => key !== k)
        })
    }
    _gotoEmailTemplateOK = () => {
        browserHistory.push('/system-settings/emailSettings/template')
    }
    _gotoEmailTemplate = () => {
        const { formatMessage } = this.props.intl
        const __this = this

        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG4576"})})}} ></span>,
            onOk() {
                __this._gotoEmailTemplateOK()
            },
            onCancel() {}
        })
    }
    _warningStart = () => {
        $.ajax({
            type: 'GET',
            async: false,
            url: api.apiHost + 'action=reloadWarning&warningStart=',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {}
            }.bind(this)
        })
    }
    _warningStop = () => {
        $.ajax({
            type: 'GET',
            async: false,
            url: api.apiHost + 'action=reloadWarning&warningStop=',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {}

                this._handleCancel()
            }.bind(this)
        })
    }
    _handleSubmit = () => {
        const { formatMessage } = this.props.intl

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG904" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG844" })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this._warningStop()

                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = {
                    action: 'warningUpdateEmailSettings'
                }

                let admin_email_list = []
                let email_list = []

                for (let i = 0; i <= 9; i++) {
                    if (values[`super_${i}`]) {
                        admin_email_list.push(values[`super_${i}`])
                    }

                    if (values[`manager_${i}`]) {
                        email_list.push(values[`manager_${i}`])
                    }
                }

                action.admin_email = admin_email_list.join(',')
                action.email = email_list.join(',')

                $.ajax({
                    data: action,
                    type: 'post',
                    url: api.apiHost,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                        }
                    }.bind(this)
                })

                this._warningStart()
            }
        })
    }
    _handleCancel = () => {

    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue, getFieldValue } = this.props.form

        let me = this
        let model_info = JSON.parse(localStorage.getItem('model_info'))
        let htmlPrivilege = JSON.parse(localStorage.getItem('html_privilege'))
        let emailPrivilege = htmlPrivilege.emailSettings === 1

        if (this.props.emailPageReload) {
            this._getInitData()
            this.props.emailPageReloadFunc(false)
        }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG2546"})
                })

        const formItemWithoutLabelLayout = {
            wrapperCol: { span: 18, offset: 3 }
        }

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const superList = this.state.superList || []
        const managerList = this.state.managerList || []

        // let superKeyList = []
        // let managerKeyList = []

        getFieldDecorator('super_keys', { initialValue: superList })
        getFieldDecorator('manager_keys', { initialValue: managerList })

        const super_keys = getFieldValue('super_keys')
        const manager_keys = getFieldValue('manager_keys')
        const formSuperItem = super_keys.map((k, index) => {
            if (index === 0) {

            } else {
                return (
                    <FormItem
                        key={ k.key }
                        { ...formItemWithoutLabelLayout }
                    >
                        <Col span="8">
                            <FormItem>
                                { getFieldDecorator(`super_${k.key}`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [
                                        {
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.email(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: me._checkDifferenceEmail
                                        }
                                    ],
                                    initialValue: k.value
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={ 1 } style={{ 'padding-left': '10px', 'font-size': '20px' }}>
                            <Icon
                                type="minus-circle-o"
                                style={{ 'cursor': 'pointer' }}
                                className="dynamic-delete-button"
                                onClick={ () => this._removeSuperEmail(k) }
                            />
                        </Col>
                    </FormItem>
                )
            }
        })

        const formManagerItem = manager_keys.map((k, index) => {
            if (index === 0) {

            } else {
                return (
                    <FormItem
                        key={ k.key }
                        { ...formItemWithoutLabelLayout }
                    >
                        <Col span="8">
                            <FormItem>
                                { getFieldDecorator(`manager_${k.key}`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [
                                        {
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.email(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: me._checkDifferenceEmail
                                        }
                                    ],
                                    initialValue: k.value
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={ 1 } style={{ 'padding-left': '10px', 'font-size': '20px' }}>
                            <Icon
                                type="minus-circle-o"
                                style={{ 'cursor': 'pointer' }}
                                className="dynamic-delete-button"
                                onClick={ () => this._removeManagerEmail(k) }
                            />
                        </Col>
                    </FormItem>
                )
            }
        })

        return (
            <div className="app-content-main">
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2573" />}>
                                    <span>{formatMessage({id: "LANG5058"})}</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={ 8 }>
                                <FormItem>
                                    { getFieldDecorator("super_0", {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [
                                                {
                                                    validator: this._checkRequire
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.email(data, value, callback, formatMessage)
                                                    }
                                                }, {
                                                    validator: me._checkDifferenceEmail
                                                }
                                            ],
                                            initialValue: superList[0] ? superList[0].value : ""
                                    })(
                                        <Input disabled={ localStorage.username === "admin" ? false : true }/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={ 1 } style={{ 'padding-left': '10px', 'font-size': '20px' }}>
                                <Icon
                                    type="plus-circle-o"
                                    className="dynamic-plus-button"
                                    onClick={ localStorage.username === "admin" ? this._addSuperEmail : ''}
                                    style={ localStorage.username === "admin" ? { 'cursor': 'pointer' } : { 'cursor': 'not-allowed' } }
                                />
                            </Col>
                            <Col span={ 6 } offset={ 1 } className={ emailPrivilege ? 'display-block' : 'hidden' }>
                                <a className="email_template" onClick={ this._gotoEmailTemplate } >{ formatMessage({id: "LANG4576"}) }</a>
                            </Col>
                        </FormItem>
                        { formSuperItem }
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2573" />}>
                                    <span>{formatMessage({id: "LANG2572"})}</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={ 8 }>
                                <FormItem>
                                    { getFieldDecorator("manager_0", {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [
                                                {
                                                    validator: this._checkManagerRequire
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.email(data, value, callback, formatMessage)
                                                    }
                                                }, {
                                                    validator: me._checkDifferenceEmail
                                                }
                                            ],
                                            initialValue: managerList[0] ? managerList[0].value : ""
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={ 1 } style={{ 'padding-left': '10px', 'font-size': '20px' }}>
                                <Icon
                                    type="plus-circle-o"
                                    className="dynamic-plus-button"
                                    style={{ 'cursor': 'pointer' }}
                                    onClick={ this._addManagerEmail }
                                />
                            </Col>
                            <Col span={ 6 } offset={ 1 } className={ emailPrivilege ? 'display-block' : 'hidden' }>
                                <a className="email_template" onClick={ this._gotoEmailTemplate } >{ formatMessage({id: "LANG4576"}) }</a>
                            </Col>
                        </FormItem>
                        { formManagerItem }
                    </Form>
                </div>
            </div>
        )
    }
}

export default injectIntl(WarningContact)
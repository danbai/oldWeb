'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Alert, Button, Col, Checkbox, Form, Input, message, Tooltip, Row, Select, Transfer } from 'antd'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

const FormItem = Form.Item
const Option = Select.Option

class CRM extends Component {
    constructor(props) {
        super(props)

        const { formatMessage } = this.props.intl

        this.state = {
            crmSettings: {},
            transferAlert: 'hidden',
            targetContactKeys: [],
            class: {
                others: 'hidden',
                sugarcrm: 'hidden',
                salesforce: 'hidden'
            },
            contactData: [{
                key: "contacts",
                value: "contacts",
                title: formatMessage({id: "LANG5116"}, {0: formatMessage({id: "LANG5117"})})
            }, {
                key: "leads",
                value: "leads",
                title: formatMessage({id: "LANG5116"}, {0: formatMessage({id: "LANG5118"})})
            }, {
                key: "accounts",
                value: "accounts",
                title: formatMessage({id: "LANG5116"}, {0: formatMessage({id: "LANG5119"})})
            }]
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getCRMSettings()
    }
    _checkJBLen = (rule, value, callback) => {
        const form = this.props.form

        if (value) {
            form.validateFields(['gs_jbmax'], { force: true })
        }

        callback()
    }
    _checkJBMax = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        const form = this.props.form
        const len = form.getFieldValue('gs_jblen')

        if (value && len && value < len) {
            callback(formatMessage({id: "LANG2142"}, { 0: formatMessage({id: "LANG1655"}), 1: formatMessage({id: "LANG2460"}) }))
        } else {
            callback()
        }
    }
    _checkHasHTTP = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (!value || /^https?:\/\//i.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG5201"}))
        }
    }
    _checkNumberAdd = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (!value || _.indexOf(this.state.targetContactKeys, value) > -1) {
            callback()
        } else {
            callback(formatMessage({id: "LANG5157"}))
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getCRMSettings = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: { action: 'getCRMSettings' },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, formatMessage)

                if (bool) {
                    let targetContactKeys = []
                    let crmSettings = res.response.crm_settings || {}

                    if (crmSettings.first_search) {
                        targetContactKeys.push(crmSettings.first_search)
                    }

                    if (crmSettings.second_search) {
                        targetContactKeys.push(crmSettings.second_search)
                    }

                    if (crmSettings.third_search) {
                        targetContactKeys.push(crmSettings.third_search)
                    }

                    this.setState({
                        crmSettings: crmSettings,
                        targetContactKeys: targetContactKeys,
                        transferAlert: (targetContactKeys.length ? 'hidden' : 'display-block')
                    })

                    this._onChangeModule(crmSettings.crm_module)
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        this.props.form.resetFields()

        this._getCRMSettings()
        // browserHistory.push('/value-added-features/crm')
    }
    _handleTransferChange = (targetContactKeys, direction, moveKeys) => {
        if (!targetContactKeys.length) {
            this.setState({
                transferAlert: 'display-block',
                targetContactKeys: targetContactKeys
            })
        } else {
            this.setState({
                transferAlert: 'hidden',
                targetContactKeys: targetContactKeys
            })
        }

        console.log('targetKeys: ', targetContactKeys)
        console.log('direction: ', direction)
        console.log('moveKeys: ', moveKeys)
    }
    _handleTransferSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        // this.setState({ targetContactKeys: nextTargetKeys })
        console.log('sourceSelectedKeys: ', sourceSelectedKeys)
        console.log('targetSelectedKeys: ', targetSelectedKeys)
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        const errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2168"}, {0: 1})}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                if (values.crm_module !== 'none' && !this.state.targetContactKeys.length) {
                    message.error(errorMessage)

                    return false
                }

                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = {}

                action.action = 'updateCRMSettings'

                if (values.crm_module === 'none') {
                    action.crm_addr = ''
                    action.crm_module = ''
                    action.number_add = ''
                    action.first_search = ''
                    action.second_search = ''
                    action.third_search = ''
                } else {
                    let targetContactKeys = this.state.targetContactKeys

                    action.crm_module = values.crm_module
                    action.number_add = values.number_add
                    action.first_search = this.state.targetContactKeys[0]
                    action.second_search = this.state.targetContactKeys[1]
                    action.third_search = this.state.targetContactKeys[2]

                    if (targetContactKeys[0]) {
                        action.first_search = targetContactKeys[0]
                    } else {
                        action.first_search = ''
                    }

                    if (targetContactKeys[1]) {
                        action.second_search = targetContactKeys[1]
                    } else {
                        action.second_search = ''
                    }

                    if (targetContactKeys[2]) {
                        action.third_search = targetContactKeys[2]
                    } else {
                        action.third_search = ''
                    }

                    if (action.crm_module === 'sugarcrm') {
                        action.crm_addr = values.crm_addr
                    }
                }

                $.ajax({
                    data: action,
                    type: 'post',
                    url: api.apiHost,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            this._handleCancel()
                        }
                    }.bind(this)
                })
            }
        })
    }
    _onChangeModule = (value) => {
        if (value === 'sugarcrm') {
            this.setState({
                class: {
                    others: 'display-block',
                    sugarcrm: 'display-block',
                    salesforce: 'hidden'
                }
            })
        } else if (value === 'salesforce') {
            this.setState({
                class: {
                    others: 'display-block',
                    sugarcrm: 'hidden',
                    salesforce: 'display-block'
                }
            })
        } else {
            this.setState({
                class: {
                    others: 'hidden',
                    sugarcrm: 'hidden',
                    salesforce: 'hidden'
                }
            })
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        let crmSettings = this.state.crmSettings || {}
        let crm_module = crmSettings.crm_module
        let crm_addr = crmSettings.crm_addr
        let number_add = crmSettings.number_add
        let first_search = crmSettings.first_search
        let second_search = crmSettings.second_search
        let third_search = crmSettings.third_search

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG5110"})})

        return (
            <div className="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG5110"}) } onSubmit={ this._handleSubmit } onCancel={ this._handleCancel } isDisplay='display-block' />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={formatMessage({id: "LANG5111"})}>
                                        <span>{formatMessage({id: "LANG5111"})}</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('crm_module', {
                                initialValue: crm_module ? crm_module : 'none'
                            })(
                                <Select onChange={ this._onChangeModule }>
                                    <Option value="none">{ formatMessage({id: "LANG2770"}) }</Option>
                                    <Option value="sugarcrm">SugarCRM</Option>
                                    <Option value="salesforce">Salesforce</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={formatMessage({id: "LANG5188"})}>
                                        <span>{formatMessage({id: "LANG5112"})}</span>
                                    </Tooltip>
                                </span>
                            )}
                            className={ this.state.class.sugarcrm }
                        >
                            { getFieldDecorator('crm_addr', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: this.state.class.sugarcrm === 'display-block', 
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this.state.class.sugarcrm === 'display-block' ? this._checkJBMax : ''
                                }, {
                                    validator: this.state.class.sugarcrm === 'display-block' ? this._checkHasHTTP : ''
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.class.sugarcrm === 'display-block' ? Validator.host(data, value, callback, formatMessage, "IP or URL") : callback()
                                    }
                                }],
                                initialValue: crm_addr
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={formatMessage({id: "LANG5120"})}>
                                        <span>{formatMessage({id: "LANG5115"})}</span>
                                    </Tooltip>
                                </span>
                            )}
                            className={ this.state.class.others }
                        >
                            { getFieldDecorator('number_add', {
                                getValueFromEvent: (e) => {
                                    let HTMLCollection = document.getElementsByClassName('select-number-add')

                                    if (HTMLCollection.length) {
                                        return UCMGUI.toggleErrorMessage(e, HTMLCollection[0])
                                    } else {
                                        return UCMGUI.toggleErrorMessage(e)
                                    }
                                },
                                rules: [{
                                    required: this.state.class.others === 'display-block',
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this.state.class.others === 'display-block' ? this._checkNumberAdd : ''
                                }],
                                initialValue: number_add
                            })(
                                <Select className="select-number-add">
                                    <Option value="contacts">{ formatMessage({id: "LANG5117"}) }</Option>
                                    <Option value="leads">{ formatMessage({id: "LANG5118"}) }</Option>
                                    <Option value="accounts">{ formatMessage({id: "LANG5119"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemTransferLayout }
                            label={(
                                <span>
                                    <Tooltip title={formatMessage({id: "LANG5114"})}>
                                        <span>{formatMessage({id: "LANG5114"})}</span>
                                    </Tooltip>
                                </span>
                            )}
                            className={ this.state.class.others }
                        >
                            {/* <Row>
                                <Col span={ 8 }>
                                    <Alert type="error" message={ formatMessage({id: "LANG2168"}, {0: 1}) } className={ this.state.transferAlert } />
                                </Col>
                            </Row> */}
                            <Transfer
                                sorter={ true }
                                render={ item => item.title }
                                dataSource={ this.state.contactData }
                                filterOption={ this._filterTransferOption }
                                targetKeys={ this.state.targetContactKeys }
                                onChange={ this._handleTransferChange }
                                onSelectChange={ this._handleTransferSelectChange }
                                searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                            />
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(CRM))

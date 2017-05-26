'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, Row } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class BarItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            targetKeys: [],
            moduleList: [],
            moduleKeyList: [],
            privilegeNameList: [],
            privilegeIDList: [],
            privilegeItem: {},
            moduleSwitch: {}
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getPrivilegeNameList()
        this._getInitData()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.privilegeNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _getPrivilegeNameList = () => {
        const { formatMessage } = this.props.intl
        const privilegeName = this.props.params.name    

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listCustomPrivilege',
                sidx: "privilege_id",
                sord: "asc"
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const tmp_privilegeList = response.privilege_id || []
                    let privilegeNameList = []
                    let privilegeIDList = []
                    tmp_privilegeList.map(function(item) {
                        privilegeNameList.push(item.privilege_name)
                        privilegeIDList.push(item.privilege_id)
                    })
                    privilegeNameList = _.without(privilegeNameList, privilegeName)

                    this.setState({
                        privilegeNameList: privilegeNameList,
                        privilegeIDList: privilegeIDList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const privilegeId = this.props.params.id
        const privilegeName = this.props.params.name
        let privilegeItem = {}
        let moduleSwitch = {}
        let moduleList = []
        let moduleKeyList = []
        let targetKeys = []

        const modulesObj = {
            'system_status': formatMessage({id: 'LANG2'}),
            'conference': formatMessage({id: 'LANG18'}),
            'warning': formatMessage({id: 'LANG2580'}),
            'cdr_record': formatMessage({id: 'LANG4053'}),
            'cdr_api': 'CDR API',
            'wakeup': formatMessage({id: 'LANG4858'})
        }

        if (privilegeId) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getCustomPrivilege',
                    privilege_id: privilegeId
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        privilegeItem = res.response.privilege_id || {}
                        moduleSwitch = response.module_switch || {}
                        // const tmpmoduleList = moduleSwitch.disable_module.split(',')
                        targetKeys = moduleSwitch.enable_module.split(',')
                        /* tmpmoduleList.map(function(item) {
                            moduleList.push({
                                key: item,
                                title: modulesObj[item]
                            })
                            moduleKeyList.push(item)
                        })
                        targetKeys.map(function(item) {
                            moduleList.push({
                                key: item,
                                title: modulesObj[item]
                            })
                            moduleKeyList.push(item)
                        }) */
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        moduleList = [{
            key: 'system_status',
            title: formatMessage({id: 'LANG2'})
        }, {
            key: 'conference',
            title: formatMessage({id: 'LANG18'})
        }, {
            key: 'warning',
            title: formatMessage({id: 'LANG2580'})
        }, {
            key: 'cdr_record',
            title: formatMessage({id: 'LANG4053'})
        }, {
            key: 'cdr_api',
            title: "CDR API"
        }, {
            key: 'wakeup',
            title: formatMessage({id: 'LANG4858'})
        }]

        moduleKeyList = ['system_status', 'conference', 'warning', 'cdr_record', 'cdr_api', 'wakeup']

        this.setState({
            moduleKeyList: moduleKeyList,
            privilegeItem: privilegeItem,
            moduleSwitch: moduleSwitch,
            targetKeys: targetKeys,
            moduleList: moduleList
        })
    }
    _handleCancel = () => {
        browserHistory.push('/maintenance/userManagement/privilege')
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _handleTransferChange = (targetKeys, direction, moveKeys) => {
        this.setState({
            targetKeys: targetKeys
        })

        console.log('targetKeys: ', targetKeys)
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

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const privilegeId = this.props.params.id
        const privilegeName = this.props.params.name

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG5167"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                if (!this.state.targetKeys.length) {
                    message.error(errorMessage)

                    return
                }

                message.loading(loadingMessage)
                const targetKeys = this.state.targetKeys
                let moduleKeyList = _.clone(this.state.moduleKeyList)

                let action = {}
                action.enable_module = targetKeys.join(',')
                action.disable_module = moduleKeyList.join(',')
                targetKeys.map(function(item) {
                    moduleKeyList = _.without(moduleKeyList, item)
                })
                action.disable_module = moduleKeyList.join(',')
                action.privilege_name = values.privilege_name

                if (privilegeId && privilegeName) {
                    if (privilegeId === '3') {
                        action = {}
                        action.en_rm_voice_recording = values.en_rm_voice_recording ? 'yes' : 'no'
                    }
                    action.action = 'updateCustomPrivilege'
                    action.privilege_id = privilegeId
                } else {
                    action.action = 'addCustomPrivilege'
                    const privilegeIDList = this.state.privilegeIDList
                    let needBreak = false
                    for (let i = 1; i <= privilegeIDList.length; i++) {
                        if (needBreak) {

                        } else {
                            if (i !== privilegeIDList[i]) {
                                action.privilege_id = i
                                needBreak = true
                            }
                        }
                    }
                    if (needBreak === false) {
                        action.privilege_id = privilegeIDList.length + 1
                    } 
                }

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                        }

                        this._handleCancel()
                    }.bind(this)
                })
            }
        })
    }
    _renderItem = (item) => {
        return {
                label: item.title,  // for displayed item
                value: item.key  // for title and filter matching
            }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const privilegeName = this.props.params.name
        const privilegeItem = this.state.privilegeItem 

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG5167"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG5167"}) }))

        const userItem = this.state.userItem || {}

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                />
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_privilege_name"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG5168" />}>
                                    <span>{formatMessage({id: "LANG5168"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('privilege_name', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 2)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkName
                                }],
                                width: 100,
                                initialValue: privilegeItem.privilege_name ? privilegeItem.privilege_name : ""
                            })(
                                <Input maxLength='32' disabled={privilegeItem.privilege_id === 3} />
                            ) }
                        </FormItem>
                        <FormItem
                            className={ privilegeItem.privilege_id === 3 ? 'display-block' : 'hidden' }
                            ref="div_en_rm_voice_recording"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG5228" />}>
                                    <span>{formatMessage({id: "LANG5228"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('en_rm_voice_recording', {
                                rules: [],
                                width: 100,
                                valuePropName: 'checked',
                                initialValue: privilegeItem.en_rm_voice_recording === 'yes'
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            className={ privilegeItem.privilege_id === 3 ? 'hidden' : 'display-block' }
                            { ...formItemTransferLayout }
                            label={(
                                <span>{ formatMessage({id: "LANG5167"}) }</span>
                            )}
                        >
                            <Transfer
                                showSearch
                                render={ this._renderItem }
                                targetKeys={ this.state.targetKeys }
                                dataSource={ this.state.moduleList }
                                onChange={ this._handleTransferChange }
                                filterOption={ this._filterTransferOption }
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                onSelectChange={ this._handleTransferSelectChange }
                                searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                titles={[formatMessage({id: "LANG5170"}, {0: formatMessage({id: "LANG5169"})}), formatMessage({id: "LANG5171"}, {0: formatMessage({id: "LANG5169"})})]}
                            />
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(BarItem))

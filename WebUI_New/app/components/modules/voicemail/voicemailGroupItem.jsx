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
import { Form, Input, message, Select, Tooltip, Checkbox, Row, Col, Transfer, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class VoicemailGroupItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            targetKeys: [],
            voicemailList: [],
            vmGroupNameList: [],
            vmGroupValues: {},
            portExtensionList: [],
            numberList: [],
            disable_extension_ranges: 'no',
            vmgStart: '6600',
            vmgEnd: '6699',
            newVMGNum: ''
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getVoicemailList()
        this._getVMgroupNameList()
        this._getVMgroup()
        this._getPortExtension()
    }

    _getVoicemailList = () => {
        const { formatMessage } = this.props.intl
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getVoicemailList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const disabled = formatMessage({id: "LANG273"})
                    let voicemailList = []
                    let extension = response.extension || []

                    voicemailList = extension.map(function(item) {
                        return {
                                key: item.extension,
                                out_of_service: item.out_of_service,
                                title: (item.extension +
                                        (item.fullname ? ' "' + item.fullname + '"' : '') +
                                        (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                            }
                    })
                    this.setState({
                        voicemailList: voicemailList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getVMgroupNameList = () => {
        const vmID = this.props.params.id
        const vmName = this.props.params.name
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getVMgroupNameList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    let vmGroupNameList = response.vmgroup_name || []
                    if (this.props.params.id) {
                        vmGroupNameList = _.without(vmGroupNameList, vmName)
                    }
                    this.setState({
                        vmGroupNameList: vmGroupNameList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getVMgroup = () => {
        const vmGroup = this.props.params.id
        const isCheckVMGroup = this.props.params.id ? true : false
        if (isCheckVMGroup) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getVMgroup',
                    vmgroup: vmGroup
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}
                        let vmGroupValues = response.vmgroup || {}

                        let targetKeys = vmGroupValues.members ? vmGroupValues.members.split(',') : []
                        this.setState({
                            vmGroupValues: vmGroupValues,
                            targetKeys: targetKeys
                        })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }
    }
    _getPortExtension = () => {
        const { formatMessage } = this.props.intl
        const vmID = this.props.params.id
        const vmName = this.props.params.name

        let prefSetting = {}
        let vmgStart = this.state.vmgStart
        let vmgEnd = this.state.vmgEnd
        let disable_extension_ranges = this.state.disable_extension_ranges

        let portExtensionList = []
        let numberList = UCMGUI.isExist.getList('getNumberList', formatMessage)
        if (vmID) {
            numberList = _.without(numberList, vmID)
        }

        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                action: "getFeatureCodes"
            },
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                var bool = UCMGUI.errorHandler(data)

                if (bool) {
                    var featureSettings = data.response.feature_settings,
                        parkext = featureSettings.parkext,
                        parkpos = featureSettings.parkpos.split('-')

                    portExtensionList.push(parseInt(parkext, 10))

                    for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                        portExtensionList.push(i)
                    }
                }
            }
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getExtenPrefSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    prefSetting = res.response.extension_pref_settings || {}
                    vmgStart = prefSetting.vmg_start
                    vmgEnd = prefSetting.vmg_end
                    disable_extension_ranges = prefSetting.disable_extension_ranges
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        
        let noNeedBreak = true
        let newVMGNum = this.state.newVMGNum
        for (let i = parseInt(vmgStart); i < parseInt(vmgEnd) && noNeedBreak; i++) {
            if (($.inArray((i + ''), numberList) > -1)) {
            } else {
                newVMGNum = i + ''
                noNeedBreak = false
            }
        }

        this.setState({
            portExtensionList: portExtensionList,
            numberList: numberList,
            vmgStart: vmgStart,
            vmgEnd: vmgEnd,
            disable_extension_ranges: disable_extension_ranges,
            newVMGNum: newVMGNum
        })
    }
    _getVMGRange = () => {

    }
    _handleCancel = () => {
        browserHistory.push('/call-features/voicemail/2')
    }

    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const vmGroupIndex = this.props.params.id
        const vmGroupName = this.props.params.name

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2169"}, {
                    0: 16,
                    1: formatMessage({id: "LANG4486"}).toLowerCase()
                 })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                const disable_extension_ranges = this.state.disable_extension_ranges
                const vmgStart = this.state.vmgStart
                const vmgEnd = this.state.vmgEnd
                if (disable_extension_ranges === 'no') {
                    const num = parseInt(values.extension)
                    if (num < parseInt(vmgStart) || num > parseInt(vmgEnd)) {
                        const { formatMessage } = this.props.intl
                        confirm({
                            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2132"}, {0: num, 1: vmgStart, 2: vmgEnd})}} ></span>,
                            onOk() {
                               browserHistory.push('/pbx-settings/pbxGeneralSettings')
                            },
                            onCancel() {
                                return
                            },
                            okText: formatMessage({id: "LANG727"}),
                            cancelText: formatMessage({id: "LANG726"})
                        })
                        return
                    }
                }

                if (this.state.targetKeys.length > 16) {
                    message.error(errorMessage)

                    return false
                }

                message.loading(loadingMessage)

                let action = values
                action.members = this.state.targetKeys.join()
                if (vmGroupIndex && vmGroupName) {
                    action.action = 'updateVMgroup'
                    action.vmgroup = values.extension
                } else {
                    action.action = 'addVMgroup'
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

    _checkNumber = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.numberList, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else if (value && _.indexOf(this.state.portExtensionList, parseInt(value)) > -1) {
            callback(formatMessage({id: "LANG2172"}, {0: formatMessage({id: "LANG2144"}), 1: formatMessage({id: "LANG2142"})}))
        } else {
            callback()
        }
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.vmGroupNameList, value) > -1) {
            callback(formatMessage({id: "LANG2143"}))
        } else {
            callback()
        }
    }

    _renderItem = (item) => {
        const customLabel = (
                <span>
                    { item.title }
                </span>
            )

        return {
                label: customLabel,  // for displayed item
                value: item.title   // for title and filter matching
            }
    }

    _handleTransferChange = (targetKeys, direction, moveKeys) => {
        this.setState({
            targetKeys: targetKeys
        })

        console.log('targetKeys extension: ', targetKeys)
        console.log('direction extension: ', direction)
        console.log('moveKeys extension: ', moveKeys)
    }

    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _handleTransferSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        // this.setState({ targetContactKeys: nextTargetKeys })
        console.log('sourceSelectedKeys: ', sourceSelectedKeys)
        console.log('targetSelectedKeys: ', targetSelectedKeys)
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const vmGroupValues = this.state.vmGroupValues

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
                    0: formatMessage({id: "LANG21"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG772"}))

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
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1569" />}>
                                    <span>{ formatMessage({id: "LANG85"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('extension', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: 'LANG2150'})
                                }, {
                                    validator: this._checkNumber
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 40)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 2)
                                    }
                                }],
                                initialValue: vmGroupValues.extension ? vmGroupValues.extension : this.state.newVMGNum
                            })(
                                <Input disabled={ false } placeholder={ formatMessage({id: "LANG85"}) } maxLength="40" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_vmgroup_name"
                            { ...formItemLayout }
                            label={(
                                <span>{ formatMessage({id: "LANG135"}) }</span>
                            )}
                        >
                            { getFieldDecorator('vmgroup_name', {
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
                                        Validator.maxlength(data, value, callback, formatMessage, 40)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkName
                                }],
                                initialValue: vmGroupValues.vmgroup_name ? vmGroupValues.vmgroup_name : ''
                            })(
                                <Input placeholder={ formatMessage({id: "LANG135"}) } maxLength="40" />
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_vmsecret"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1080" />}>
                                    <span>{ formatMessage({id: "LANG1079"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('vmsecret', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 4)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 40)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.checkNumericPw(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: vmGroupValues.vmsecret ? vmGroupValues.vmsecret : ''
                            })(
                                <Input placeholder={ formatMessage({id: "LANG1079"}) } maxLength="40" />
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_email"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1082" />}>
                                    <span>{ formatMessage({id: "LANG1081"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('email', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.email(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 256)
                                    }
                                }],
                                initialValue: vmGroupValues.email ? vmGroupValues.email : ''
                            })(
                                <Input placeholder={ formatMessage({id: "LANG1081"}) } maxLength="256" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemTransferLayout }
                            label={(
                                <span>{ formatMessage({id: "LANG2032"}) }</span>
                            )}
                        >
                            <Transfer
                                showSearch
                                render={ this._renderItem }
                                targetKeys={ this.state.targetKeys }
                                dataSource={ this.state.voicemailList }
                                onChange={ this._handleTransferChange }
                                filterOption={ this._filterTransferOption }
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                onSelectChange={ this._handleTransferSelectChange }
                                searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                titles={[formatMessage({id: "LANG1567"}), formatMessage({id: "LANG1568"})]}
                            />
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(VoicemailGroupItem))

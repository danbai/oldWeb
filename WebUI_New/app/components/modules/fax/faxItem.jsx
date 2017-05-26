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
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class FaxItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            faxItem: {},
            numberList: [],
            faxStart: '7200',
            faxEnd: '8200',
            disable_extension_ranges: 'no',
            newFaxNum: '',
            portExtensionList: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getFaxRange()
        this._getInitData()
        this._getPortExtension()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.faxNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkExtension = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.numberList, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _checkIfInPort = (rules, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.portExtensionList, parseInt(value)) > -1) {
            callback(formatMessage({id: "LANG2172"}, {0: formatMessage({id: "LANG1244"}), 1: formatMessage({id: "LANG1242"})}))
        } else {
            callback()
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getInitData = () => {
        const faxId = this.props.params.id
        const faxName = this.props.params.name
        let numberList = this.state.numberList
        let faxNameList = this.state.faxNameList
        let faxItem = {}
        let newFaxNum = ''

        let getList = []
        getList.push({"getNumberList": ""})
        getList.push({"getFaxNameList": ""})

        $.ajax({
            url: api.apiHost + 'action=combineAction&data=' + JSON.stringify(getList),
            method: 'GET',
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const getNumberList = response.getNumberList || {}
                    const getFaxNameList = response.getFaxNameList || {}

                    numberList = getNumberList.number || []
                    faxNameList = getFaxNameList.fax_name || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getNumberList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    numberList = res.response.number || {}
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (faxId) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getFax',
                    fax: faxId
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        faxItem = res.response.fax || {}
                        if (faxItem.extension) {
                            numberList = _.without(numberList, faxItem.extension)
                        }
                        if (faxItem.fax_name) {
                            faxNameList = _.without(numberList, faxItem.fax_name)
                        }
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        } else {
            const faxStart = this.state.faxStart
            const faxEnd = this.state.faxEnd
            
            let noNeedBreak = true
            for (let i = parseInt(faxStart); i < parseInt(faxEnd) && noNeedBreak; i++) {
                if (($.inArray((i + ''), numberList) > -1)) {
                } else {
                    newFaxNum = i + ''
                    noNeedBreak = false
                }
            }
        }

        this.setState({
            faxItem: faxItem,
            numberList: numberList,
            faxNameList: faxNameList,
            newFaxNum: newFaxNum
        })
    }
    _getFaxRange = () => {
        let prefSetting = {}
        let faxStart = this.state.faxStart
        let faxEnd = this.state.faxEnd
        let disable_extension_ranges = this.state.disable_extension_ranges

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
                    faxEnd = prefSetting.fax_end
                    faxStart = prefSetting.fax_start
                    disable_extension_ranges = prefSetting.disable_extension_ranges
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            faxStart: faxStart,
            faxEnd: faxEnd,
            disable_extension_ranges: disable_extension_ranges
        })
    }
    _getPortExtension = () => {
        const { formatMessage } = this.props.intl

        let portExtensionList = []

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

        this.setState({
            portExtensionList: portExtensionList
        })
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/fax')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const faxId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                const disable_extension_ranges = this.state.disable_extension_ranges
                const faxStart = this.state.faxStart
                const faxEnd = this.state.faxEnd
                if (disable_extension_ranges === 'no') {
                    const num = parseInt(values.extension)
                    if (num < parseInt(faxStart) || num > parseInt(faxEnd)) {
                        const { formatMessage } = this.props.intl
                        confirm({
                            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2132"}, {0: num, 1: faxStart, 2: faxEnd})}} ></span>,
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

                message.loading(loadingMessage)

                let action = {}
                
                action["fax_name"] = values.fax_name
                action["email"] = values.email

                if (faxId) {
                    action.action = 'updateFax'
                    action.fax = faxId
                } else {
                    action.action = 'addFax'
                    action["extension"] = values.extension
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
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

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
                    0: formatMessage({id: "LANG1268"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG1268"}) }))

        const faxItem = this.state.faxItem || {}

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
                            ref="div_extension"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG85" />}>
                                    <span>{formatMessage({id: "LANG85"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('extension', {
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
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkExtension
                                }, {
                                    validator: this._checkIfInPort
                                }],
                                width: 100,
                                initialValue: faxItem.extension ? faxItem.extension : this.state.newFaxNum
                            })(
                                <Input maxLength="25" disabled={ this.props.params.id ? true : false } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_fax_name"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG135" />}>
                                    <span>{formatMessage({id: "LANG135"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('fax_name', {
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
                                initialValue: faxItem.fax_name
                            })(
                                <Input maxLength="25" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_email"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1259" />}>
                                    <span>{formatMessage({id: "LANG126"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('email', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.email(data, value, callback, formatMessage)
                                    }
                                }],
                                width: 100,
                                initialValue: faxItem.email ? faxItem.email : ""
                            })(
                                <Input maxLength="128" />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(FaxItem))

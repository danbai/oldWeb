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
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select} from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class AnnouncementGroup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            targetKeys: [],
            accountList: [],
            groupItem: {},
            groupNameList: [],
            groupNumberList: [],
            numberList: [],
            codeNumberList: [],
            portExtensionList: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getNumberList()
        this._getGroupList()
        this._getCodeList()
        this._getInitData()
        this._getPortExtension()
    }
    _beginsWith = (value, sub) => {
        if (value && sub && value.length > sub.length) {
            const len = sub.length
            const tmp = value.slice(0, len)
            if (tmp === sub) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
         
        if (value && _.indexOf(this.state.groupNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkExtension = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const ID = this.props.params.id

        if (value && ID && value === ID) {
            callback()
        } else if (value && _.indexOf(this.state.numberList, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else if (value && _.indexOf(this.state.groupNumberList, value) > -1) {
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
    _checkIfContainOtherCodes = (rule, value, callback) => {
        const ID = this.props.params.id

        if (value && ID && value === ID) {
            callback()
        } else if (value) {
            const { formatMessage } = this.props.intl
            const me = this
            var contain = false,
                codeNumberList = this.state.codeNumberList,
                groupNumberList = this.state.groupNumberList,
                numberList = this.state.numberList,
                portExtensionList = this.state.portExtensionList

            groupNumberList.map(function(item) {
                if (me._beginsWith(value, item)) {
                    contain = true
                    callback(formatMessage({id: "LANG2126"}))
                    return
                } else if (me._beginsWith(item, value)) {
                    contain = true
                    callback(formatMessage({id: "LANG2126"}))
                    return
                }
            })
            codeNumberList.map(function(item) {
                if (_.indexOf(numberList, (item + '' + value)) > -1) {
                    contain = true
                    callback(formatMessage({id: "LANG2126"}))
                    return
                }
                if (_.indexOf(portExtensionList, parseInt(item + '' + value)) > -1) {
                    callback(formatMessage({id: "LANG2172"}, {0: formatMessage({id: "LANG1244"}), 1: formatMessage({id: "LANG1242"})}))
                    return
                }
            })

            if (contain) {
                callback(formatMessage({id: "LANG2126"}))
            } else {
                callback()
            }
        } else {
            callback()
        }
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
    _getNumberList = () => {
        let numberList = this.state.numberList || []
        const __this = this

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

                    numberList = response.number
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            numberList: numberList
        })
    }
    _getCodeList = () => {
        let codeNumberList = this.state.codeNumberList || []
        const __this = this

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listCodeblueCode'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    response.codeblue_code.map(function(item) {
                        codeNumberList.push(item.extension)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            codeNumberList: codeNumberList
        })
    }
    _getGroupList = () => {
        let groupNumberList = this.state.groupNumberList || []
        let groupNameList = this.state.groupNameList || []
        const __this = this

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listCodeblueGroup'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    response.codeblue_group.map(function(item) {
                        groupNumberList.push(item.extension)
                        groupNameList.push(item.group_name)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            groupNumberList: groupNumberList,
            groupNameList: groupNameList
        })
    }
    _getInitData = () => {
        const groupId = this.props.params.id
        const groupName = this.props.params.name
        const { formatMessage } = this.props.intl
        let groupNameList = this.state.groupNameList
        let groupNumberList = this.state.groupNumberList
        let accountList = []
        let groupItem = {}
        let targetKeys = []

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getAccountList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const extension = response.extension || []
                    const disabled = formatMessage({id: "LANG273"})

                    accountList = extension.map(function(item) {
                        return {
                                key: item.extension,
                                out_of_service: item.out_of_service,
                                // disabled: (item.out_of_service === 'yes'),
                                title: (item.extension +
                                        (item.fullname ? ' "' + item.fullname + '"' : '') +
                                        (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                            }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (groupId) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getCodeblueGroup',
                    codeblue_group: groupId
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        groupItem = res.response.codeblue_group || {}
                        targetKeys = groupItem.members.split(',') || []
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }
        if (groupId) {
            groupNumberList = _.without(groupNumberList, groupId)
        }
        if (groupName) {
            groupNameList = _.without(groupNameList, groupName)
        }

        this.setState({
            accountList: accountList,
            groupItem: groupItem,
            targetKeys: targetKeys,
            groupNameList: groupNameList,
            groupNumberList: groupNumberList
        })
    }
    _handleCancel = () => {
        browserHistory.push('/value-added-features/announcementCenter')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let errorMessageMax = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const groupId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>
        errorMessageMax = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2169"}, {
                    0: 100, 1: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                if (!this.state.targetKeys.length) {
                    message.error(errorMessage)
                    return
                }
                if (this.state.targetKeys.length > 100) {
                    message.error(errorMessageMax)
                    return
                }

                message.loading(loadingMessage)

                let action = {}

                action.members = this.state.targetKeys.join()
                action.group_name = values.group_name

                if (groupId) {
                    action.action = 'updateCodeblueGroup'
                    action.codeblue_group = groupId
                } else {
                    action.action = 'addCodeblueGroup'
                    action.extension = values.codeblue_group
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
    _renderItem = (item) => {
        const customLabel = (
                <span className={ item.out_of_service === 'yes' ? 'out-of-service' : '' }>
                    { item.title }
                </span>
            )

        return {
                label: customLabel,  // for displayed item
                value: item.title   // for title and filter matching
            }
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
                    0: formatMessage({id: "LANG4339"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG4339"}) }))

        const groupItem = this.state.groupItem || {}

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
                            ref="div_group_name"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG135" />}>
                                    <span>{formatMessage({id: "LANG135"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('group_name', {
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
                                        Validator.maxlength(data, value, callback, formatMessage, 64)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkName
                                }],
                                width: 100,
                                initialValue: groupItem.group_name
                            })(
                                <Input maxLength="128" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_codeblue_group"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4345" />}>
                                    <span>{formatMessage({id: "LANG4342"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('codeblue_group', {
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
                                    validator: this._checkExtension
                                }, {
                                    validator: this._checkIfContainOtherCodes
                                }],
                                width: 100,
                                initialValue: groupItem.extension
                            })(
                                <Input maxLength="128" disabled={ this.props.params.id ? true : false } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemTransferLayout }
                            label={(
                                <span>{ formatMessage({id: "LANG128"}) }</span>
                            )}
                        >
                            <Transfer
                                showSearch
                                sorter={ true }
                                render={ this._renderItem }
                                targetKeys={ this.state.targetKeys }
                                dataSource={ this.state.accountList }
                                onChange={ this._handleTransferChange }
                                filterOption={ this._filterTransferOption }
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                onSelectChange={ this._handleTransferSelectChange }
                                searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                            />
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(AnnouncementGroup))
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
import { Form, Input, message, Tooltip, Radio, Transfer, Modal } from 'antd'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const confirm = Modal.confirm

class DialByNameItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            targetKeys: [],
            targetKeysLDAP: [],
            accountList: [],
            ldapList: [],
            nameList: [],
            groupList: [],
            numberList: [],
            dialByNameItem: {},
            portExtensionList: [],
            directoryStart: '7101',
            directoryEnd: '7199',
            newDialNum: '',
            disable_extension_ranges: 'no'
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.nameList, parseInt(value)) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkNumber = (rule, value, callback) => {
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
        let targetKeys = []
        let targetKeysLDAP = []
        let accountList = []
        let ldapList = []
        let nameList = []
        let groupList = []
        let numberList = []
        let dialByName = {}
        let portExtensionList = []
        let directoryStart = this.state.directoryStart
        let directoryEnd = this.state.directoryEnd
        let disable_extension_ranges = this.state.disable_extension_ranges

        const { formatMessage } = this.props.intl
        const account = this.props.params.id
        const name = this.props.params.name

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getDirectoryNameList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    nameList = response.name || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getNumberList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    numberList = response.number || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getAccountList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const extension = response.extension || []
                    const disabled = formatMessage({id: "LANG273"})

                    accountList = extension.map(function(item) {
                        return {
                                key: item.extension,
                                value: item.extension,
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

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getExtensionGroupList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const extension = response.extension_groups || []
                    const extgroupLabel = formatMessage({id: "LANG2714"})

                    groupList = extension.map(function(item) {
                        return {
                                key: item.group_id,
                                value: item.group_id,
                                out_of_service: "no",
                                // disabled: (item.out_of_service === 'yes'),
                                title: (extgroupLabel + "--" + item.group_name)
                            }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listPhonebookDn'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const ldap_tmp = response.ldap_phonebooks || []
                    const disabled = formatMessage({id: "LANG273"})

                    let ldap = []

                    ldap_tmp.map(function(item) {
                        if (item.dn !== 'ou=pbx,dc=pbx,dc=com') {
                            ldap.push(item)
                        }
                    })

                    ldapList = ldap.map(function(item) {
                        // if (item.id !== 1) {
                            return {
                                key: item.dn,
                                value: item.dn,
                                title: item.dn
                            }
                        // }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (account) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    action: 'getDirectory',
                    directory: account
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        dialByName = res.response.directory || {}
                        targetKeys = dialByName.members ? dialByName.members.split(',') : []
                        targetKeysLDAP = dialByName.members_ldap ? dialByName.members_ldap.split('|') : []
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }
 
        $.ajax({
            async: false,
            type: "post",
            url: api.apiHost,
            data: {
                action: "getFeatureCodes"
            },
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
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getExtenPrefSettings'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    let prefSetting = res.response.extension_pref_settings || {}

                    directoryStart = prefSetting.directory_start
                    directoryEnd = prefSetting.directory_end
                    disable_extension_ranges = prefSetting.disable_extension_ranges
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        
        let noNeedBreak = true
        let newDialNum = this.state.newDialNum

        for (let i = parseInt(directoryStart); i < parseInt(directoryEnd) && noNeedBreak; i++) {
            if (($.inArray((i + ''), numberList) > -1)) {
            } else {
                newDialNum = i + ''
                noNeedBreak = false
            }
        }

        if (name) {
            nameList = _.without(nameList, name)
        }

        if (account) {
            numberList = _.without(numberList, account)
        }

        for (let i = 0; i < groupList.length; i++) {
            accountList.push(groupList[i])
        }

        this.setState({
            targetKeys: targetKeys,
            targetKeysLDAP: targetKeysLDAP,
            accountList: accountList,
            ldapList: ldapList,
            nameList: nameList,
            numberList: numberList,
            groupList: groupList,
            dialByNameItem: dialByName,
            portExtensionList: portExtensionList,
            directoryEnd: directoryEnd,
            directoryStart: directoryStart,
            newDialNum: newDialNum,
            disable_extension_ranges: disable_extension_ranges
        })
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/dialByName')
    }
    _handleTransferChange = (targetKeys, direction, moveKeys) => {
        this.setState({
            targetKeys: targetKeys
        })

        console.log('targetKeys: ', targetKeys)
        console.log('direction: ', direction)
        console.log('moveKeys: ', moveKeys)
    }
    _handleTransferChangeLDAP = (targetKeys, direction, moveKeys) => {
        this.setState({
            targetKeysLDAP: targetKeys
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
        const account = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                if (!this.state.targetKeys.length && !this.state.targetKeysLDAP.length) {
                    message.error(errorMessage)

                    return
                }

                const disable_extension_ranges = this.state.disable_extension_ranges
                const directoryStart = this.state.directoryStart
                const directoryEnd = this.state.directoryEnd

                if (disable_extension_ranges === 'no') {
                    const num = parseInt(values.extension)

                    if (num < parseInt(directoryStart) || num > parseInt(directoryEnd)) {
                        const { formatMessage } = this.props.intl

                        confirm({
                            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2132"}, {0: num, 1: directoryStart, 2: directoryEnd})}} ></span>,
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

                let action = values

                action.members = this.state.targetKeys.join()
                action.members_ldap = this.state.targetKeysLDAP.join('|')

                if (account) {
                    action.action = 'updateDirectory'
                    action.directory = account
                } else {
                    action.action = 'addDirectory'
                }

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

                        this._handleCancel()
                    }.bind(this)
                })
            }
        })
    }
    _renderItem = (item) => {
        const customLabel = (
                <span className={ item.out_of_service === 'yes' ? 'out-of-service' : '' }>
                    { item.title }
                </span>
            )

        return {
                label: customLabel,  // for displayed item
                value: item.value   // for title and filter matching
            }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const dialByNameItem = this.state.dialByNameItem || {}
        const name = dialByNameItem.name
        const account = dialByNameItem.id
        const exten = this.props.params.id

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
                    0: formatMessage({id: "LANG2884"}),
                    1: this.props.params.id
                })
                : formatMessage({id: "LANG2885"}))

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
                                <span>{ formatMessage({id: "LANG135"}) }</span>
                            )}
                        >
                            { getFieldDecorator('name', {
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
                                initialValue: name
                            })(
                                <Input placeholder={ formatMessage({id: "LANG135"}) } maxLength="25" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>{ formatMessage({id: "LANG85"}) }</span>
                            )}
                        >
                            { getFieldDecorator('extension', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG85"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 2)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkNumber
                                }, {
                                    validator: this._checkIfInPort
                                }],
                                initialValue: exten ? exten : this.state.newDialNum
                            })(
                                <Input disabled={ this.props.params.id ? true : false } placeholder={ formatMessage({id: "LANG85"}) } maxLength="25" />
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
                                render={ this._renderItem }
                                targetKeys={ this.state.targetKeys }
                                dataSource={ this.state.accountList }
                                onChange={ this._handleTransferChange }
                                filterOption={ this._filterTransferOption }
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                onSelectChange={ this._handleTransferSelectChange }
                                searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                titles={[formatMessage({id: "LANG2484"}), formatMessage({id: "LANG2483"})]}
                            />
                        </FormItem>
                        <FormItem
                            { ...formItemTransferLayout }
                            label={(
                                <span>{ formatMessage({id: "LANG714"}) }</span>
                            )}
                        >
                            <Transfer
                                showSearch
                                render={ this._renderItem }
                                targetKeys={ this.state.targetKeysLDAP }
                                dataSource={ this.state.ldapList }
                                onChange={ this._handleTransferChangeLDAP }
                                filterOption={ this._filterTransferOption }
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                onSelectChange={ this._handleTransferSelectChange }
                                searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                titles={[formatMessage({id: "LANG3214"}), formatMessage({id: "LANG3215"})]}
                            />
                        </FormItem>
                        <div className="function-description">
                            <span>{ formatMessage({id: "LANG74"}) }</span>
                        </div>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG5347" />}>
                                    <span>{ formatMessage({id: "LANG5346"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('wait_time', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 3, 60)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: dialByNameItem.wait_time ? dialByNameItem.wait_time : '5'
                            })(
                                <Input placeholder={ formatMessage({id: "LANG5346"}) } maxLength="3" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2764" />}>
                                    <span>{ formatMessage({id: "LANG2890"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('query_type', {
                                rules: [],
                                initialValue: dialByNameItem.query_type ? dialByNameItem.query_type : 'LASTNAME'
                            })(
                                <RadioGroup>
                                    <Radio value='LASTNAME'>{ formatMessage({id: "LANG2892"}) }</Radio>
                                    <Radio value='FIRSTNAME'>{ formatMessage({id: "LANG2893"}) }</Radio>
                                </RadioGroup>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2765" />}>
                                    <span>{ formatMessage({id: "LANG2891"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('select_type', {
                                rules: [],
                                initialValue: dialByNameItem.select_type ? dialByNameItem.select_type : 'SEQ'
                            })(
                                <RadioGroup>
                                    <Radio value='SEQ'>{ formatMessage({id: "LANG2895"}) }</Radio>
                                    <Radio value='MENU'>{ formatMessage({id: "LANG2896"}) }</Radio>
                                </RadioGroup>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(DialByNameItem))
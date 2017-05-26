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
import { Form, Input, message, Transfer, Tooltip, Select, Checkbox, Row, Col, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class PagingIntercomItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            fileList: [],
            targetKeys: [],
            numberList: [],
            accountList: [],
            groupNameList: [],
            pagingIntercomItem: {},
            portExtensionList: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
        this._getPortExtension()
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
    _gotoPromptOk = () => {
        browserHistory.push('/pbx-settings/voicePrompt/2')
    }
    _gotoPrompt = () => {
        const __this = this
        const { formatMessage } = this.props.intl

        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG28"})})}} ></span>,
            onOk() {
                __this._gotoPromptOk()
            },
            onCancel() {},
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
        })
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _removeSuffix = (filename) => {
        let name = filename.toLocaleLowerCase(),
            file_suffix = [".mp3", ".wav", ".gsm", ".ulaw", ".alaw"]

        for (let i = 0; i < file_suffix.length; i++) {
            let num = name.lastIndexOf(file_suffix[i])

            if (num !== -1 && name.endsWith(file_suffix[i])) {
                filename = filename.substring(0, num)

                return filename
            }
        }
    }
    _getInitData = () => {
        const __this = this
        const { formatMessage } = this.props.intl
        const paginggroupId = this.props.params.id
        const paginggroupName = this.props.params.name

        let getList = []
        let fileList = []
        let numberList = []
        let targetKeys = []
        let accountList = []
        let extgroupObj = {}
        let extgroupList = []
        let groupNameList = []
        let pagingIntercom = {}

        getList.push({"getNumberList": ""})
        getList.push({"getAccountList": ""})
        getList.push({"getPaginggroupNameList": ""})

        $.ajax({
            method: 'GET',
            type: 'json',
            async: false,
            url: api.apiHost + 'action=combineAction&data=' + JSON.stringify(getList),
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const disabled = formatMessage({id: "LANG273"})
                    const getNumberList = response.getNumberList || {}
                    const getAccountList = response.getAccountList || {}
                    const getAccountList_extension = getAccountList.extension
                    const getPaginggroupNameList = response.getPagingGroupNameList || {}

                    numberList = getNumberList.number || []
                    groupNameList = getPaginggroupNameList.paginggroup_name || []

                    accountList = getAccountList_extension.map(function(item) {
                        return {
                                key: item.extension,
                                out_of_service: item.out_of_service,
                                // disabled: (item.out_of_service === 'yes'),
                                label: (item.extension +
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
                sidx: 'n',
                type: 'ivr',
                sord: 'desc',
                action: 'listFile',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["mp3","wav","gsm","ulaw","alaw"]}'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    response.ivr.map(function(item) {
                        let obj = { 
                            text: item.n,
                            val: "record/" + __this._removeSuffix(item.n)
                        }
                        fileList.push(obj)
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
                sord: 'asc',
                sidx: 'group_id',
                action: 'listExtensionGroup'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    let membersLabel = formatMessage({id: "LANG128"})
                    let extgroupLabel = formatMessage({id: "LANG2714"})

                    extgroupList = response.extension_group || []

                    _.map(extgroupList, (item) => {
                        let members = item.members,
                            length = members ? members.split(',').length : 0,
                            membersList = members.split(',').sort(),
                            obj = {
                                    key: item.group_id,
                                    value: item.group_id,
                                    members: membersList.join(),
                                    title: length + ' ' + membersLabel + ': ' + membersList.join(),
                                    label: extgroupLabel + ' -- ' + item.group_name + ' -- ' + length + ' ' + membersLabel
                                }

                        accountList.push(obj)
                        extgroupObj[item.group_id] = obj
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (paginggroupId) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    action: 'getPaginggroup',
                    paginggroup: paginggroupId
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        pagingIntercom = res.response.paginggroup || {}
                        targetKeys = pagingIntercom.members.split(',') || []
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        if (pagingIntercom.paginggroup_name) {
            groupNameList = _.without(groupNameList, pagingIntercom.paginggroup_name)
        }

        if (pagingIntercom.extension) {
            numberList = _.without(numberList, pagingIntercom.extension)
        }

        // if (extensionGroupName) {
        //     groupNameList = _.without(groupNameList, extensionGroupName)
        // }

        this.setState({
            fileList: fileList,
            numberList: numberList,
            targetKeys: targetKeys,
            accountList: accountList,
            extgroupObj: extgroupObj,
            extgroupList: extgroupList,
            groupNameList: groupNameList,
            pagingIntercomItem: pagingIntercom
        })
    }
    _getPortExtension = () => {
        const { formatMessage } = this.props.intl

        let portExtensionList = []

        $.ajax({
            type: "post",
            async: false,
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

        this.setState({
            portExtensionList: portExtensionList
        })
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/pagingIntercom')
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

        const { formatMessage } = this.props.intl
        const paginggroupId = this.props.params.id

        let featureLimits = JSON.parse(localStorage.featureLimits)
        let paginggroupMemberMax = featureLimits.paging_interciom_members ? featureLimits.paging_interciom_members : '45'

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        let errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                if (!this.state.targetKeys.length) {
                    message.warning(errorMessage)

                    return false
                } else if (this.state.targetKeys.length) {
                    let selectMemberList = []
                    let selectMemberLength = []
                    let targetKeys = this.state.targetKeys
                    let extgroupObj = this.state.extgroupObj

                    _.map(targetKeys, (data) => {
                        let group = extgroupObj[data]

                        if (group) {
                            let groupMembers = group.members

                            if (groupMembers) {
                                groupMembers = groupMembers.split(',')

                                _.map(groupMembers, (value) => {
                                    if (value && (_.indexOf(selectMemberList, value) === -1)) {
                                        selectMemberList.push(value)
                                    }
                                })
                            }
                        } else {
                            if ((_.indexOf(selectMemberList, data) === -1)) {
                                selectMemberList.push(data)
                            }
                        }
                    })

                    if (selectMemberList.length > paginggroupMemberMax) {
                        selectMemberList = selectMemberList.length ? selectMemberList.length.toString() : '0'

                        let maxLengthMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5656"}, {
                                    0: paginggroupMemberMax, 1: formatMessage({id: "LANG128"}).toLowerCase(), 2: selectMemberList
                                })}}></span>

                        message.destroy()
                        message.error(maxLengthMessage, 2)

                        return
                    }
                }

                message.loading(loadingMessage)

                let action = values

                action.replace_caller_id = values.replace_caller_id === true ? 'yes' : 'no'

                action.members = this.state.targetKeys.join()

                if (paginggroupId) {
                    action.action = 'updatePaginggroup'
                    action.paginggroup = paginggroupId
                } else {
                    action.action = 'addPaginggroup'
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
                <span className={ item.out_of_service === 'yes' ? 'out-of-service' : '' } title={ item.title }>
                    { item.label }
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

        const pagingIntercomItem = this.state.pagingIntercomItem || {}
        const name = pagingIntercomItem.paginggroup_name

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemPromptLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 9 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG604"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG604"}))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    isDisplay='display-block'
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG135" /> }>
                                    <span>{ formatMessage({id: "LANG135"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('paginggroup_name', {
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
                                <Input placeholder={ formatMessage({id: "LANG135"}) } maxLength='25' />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG85" /> }>
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

                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkExtension
                                }, {
                                    validator: this._checkIfInPort
                                }],
                                initialValue: pagingIntercomItem.extension
                            })(
                                <Input placeholder={ formatMessage({id: "LANG85"}) } maxLength='25' />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG84" /> }>
                                    <span>{ formatMessage({id: "LANG84"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('paginggroup_type', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: pagingIntercomItem.paginggroup_type ? pagingIntercomItem.paginggroup_type : "2way" 
                            })(
                                <Select>
                                    <Option value="2way">{ formatMessage({id: "LANG1162"}) }</Option>
                                    <Option value="1way">{ formatMessage({id: "LANG1161"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5074" /> }>
                                    <span>{ formatMessage({id: "LANG5071"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('replace_caller_id', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                valuePropName: 'checked',
                                initialValue: pagingIntercomItem.replace_caller_id === "yes"
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemPromptLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3490" /> }>
                                    <span>{ formatMessage({id: "LANG28"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Row>
                                <Col span={ 16 }>
                                { getFieldDecorator('custom_prompt', {
                                    rules: [],
                                    initialValue: pagingIntercomItem.custom_prompt ? pagingIntercomItem.custom_prompt : ""
                                })(
                                    <Select>
                                        <Option key="" value="">{ formatMessage({id: "LANG133"}) }</Option>
                                        {
                                            this.state.fileList.map(function(item) {
                                                return <Option
                                                        key={ item.text }
                                                        value={ item.val }>
                                                        { item.text }
                                                    </Option>
                                                }
                                            ) 
                                        }
                                    </Select>
                                ) }
                                </Col>
                                <Col span={ 6 } offset={ 1 }>
                                    <a className="prompt_setting" onClick={ this._gotoPrompt }>{ formatMessage({id: "LANG1484"}) }</a>
                                </Col>
                            </Row>
                        </FormItem>
                        <FormItem
                            { ...formItemTransferLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG128" /> }>
                                    <span>{ formatMessage({id: "LANG128"}) }</span>
                                </Tooltip>
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
                                titles={ [formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})] }
                            />
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(PagingIntercomItem))

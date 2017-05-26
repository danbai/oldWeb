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
import { Button, Checkbox, Col, Form, Input, Icon, message, Radio, Row, Select, Table, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

class FollowMe extends Component {
    constructor(props) {
        super(props)

        this.state = {
            followmeItem: {},
            followmeMembers: [],
            member_type: 'local',
            memberAccountList: [],
            destination_value: '',
            enable_destination: false,
            destination_type: 'account',
            mohNameList: ['default', 'ringbacktone_default'],
            currentExtension: localStorage.getItem('username'),
            destinationListDataSource: {
                'ivr': [],
                'account': [],
                'voicemail': [],
                'queue': [],
                'ringgroup': [],
                'vmgroup': [],
                'external_number': []
            }
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _addMembers = () => {
        // e.preventDefault()

        const form = this.props.form
        const { formatMessage } = this.props.intl
        const fields = ['member_type', 'member_local', 'member_external', 'member_ringtime', 'member_order']

        form.validateFieldsAndScroll(fields, { force: true }, (err, values) => {
            if (!err) {
                let followmeMembers = _.clone(this.state.followmeMembers)

                if (values.member_order === 'after') {
                    let obj = {
                            key: followmeMembers.length,
                            ringtime: values.member_ringtime
                        }

                    if (values.member_type === 'local') {
                        obj.extension = [values.member_local]
                    } else {
                        obj.extension = [values.member_external]
                    }

                    followmeMembers.push(obj)
                } else {
                    let obj = followmeMembers[followmeMembers.length - 1]

                    obj.ringtime = values.member_ringtime

                    if (values.member_type === 'local') {
                        obj.extension.push(values.member_local)
                    } else {
                        obj.extension.push(values.member_external)
                    }

                    followmeMembers[followmeMembers.length - 1] = obj
                }

                this.setState({
                    member_type: 'local',
                    followmeMembers: followmeMembers
                })

                form.resetFields(fields)
            }
        })
    }
    _checkMemberConflict = (data, val, callback) => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let error = false
        let order = form.getFieldValue('member_order')

        if (val && order === 'alongWith') {
            let lastMember = _.last(this.state.followmeMembers)

            if (_.indexOf(lastMember.extension, val) !== -1) {
                error = true
            }
        }

        if (error) {
            callback(formatMessage({id: "LANG2207"}))
        } else {
            callback()
        }
    }
    _createExtension = (text, record, index) => {
        let extension
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form

        extension = <div style={{ 'paddingLeft': '10px', 'textAlign': 'left' }}>
                    <span>{ record.extension.join(' & ') }</span>
                    <span style={{ 'padding': '0 5px' }}>{ formatMessage({id: "LANG569"}) }</span>
                    <span style={{ 'padding': '0 5px' }}>{ record.ringtime }</span>
                    {/* getFieldDecorator(`member_ringtime_${record.key}`, {
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
                            validator: (data, value, callback) => {
                                Validator.range(data, value, callback, formatMessage, 10, 60)
                            }
                        }],
                        initialValue: record.ringtime
                    })(
                        <Input style={{ 'width': '50px' }} onChange={ this._onChangeRingtime.bind(this, record.key) } />
                    ) */}
                    <span style={{ 'padding': '0 5px' }}>{ formatMessage({id: "LANG570"}) }</span>
                </div>

        return extension
    }
    _createOption = (text, record, index) => {
        const { formatMessage } = this.props.intl

        return <div>
                <span
                    className="sprite sprite-del"
                    onClick={ this._delete.bind(this, record.key) }>
                </span>
            </div>
    }
    _delete = (key) => {
        let { form } = this.props
        let followmeMembers = _.clone(this.state.followmeMembers)

        followmeMembers = _.filter(followmeMembers, (data) => { return data.key !== key })

        this.setState({
                followmeMembers: followmeMembers
            }, () => {
                if (!followmeMembers.length) {
                    form.setFieldsValue({
                        member_order: 'after'
                    })
                }
            })
    }
    _getInitData = () => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        const Disabled = formatMessage({id: "LANG273"})
        const currentExtension = this.state.currentExtension

        let mohNameList = []
        let followmeItem = {}
        let followmeMembers = []
        let memberAccountList = []
        let destination_value = ''
        let enable_destination = false
        let destination_type = 'account'
        let destinationListDataSource = {}
        let getList = [
                { 'getIVRList': '' },
                { 'getQueueList': '' },
                { 'getMOHNameList': '' },
                { 'getVMGroupList': '' },
                { 'getAccountList': '' },
                { 'getVoicemailList': '' },
                { 'getRingGroupList': '' }
            ]

        $.ajax({
            type: 'GET',
            url: api.apiHost + 'action=combineAction&data=' + JSON.stringify(getList),
            success: function(res) {
                let bool = UCMGUI.errorHandler(res, null, formatMessage)

                if (bool) {
                    let response = res.response || {}

                    let ivrList = response.getIVRList.ivr || []
                    let queueList = response.getQueueList.queues || []
                    let vmgroupList = response.getVMGroupList.vmgroups || []
                    let accountList = response.getAccountList.extension || []
                    let voicemailList = response.getVoicemailList.extension || []
                    let ringgroupList = response.getRingGroupList.ringgroups || []

                    ivrList = ivrList.map(function(item) {
                            return {
                                    key: item.ivr_id,
                                    value: item.ivr_id,
                                    label: item.ivr_name
                                }
                        })

                    queueList = queueList.map(function(item) {
                            return {
                                key: item.extension,
                                value: item.extension,
                                label: item.queue_name
                            }
                        })

                    vmgroupList = vmgroupList.map(function(item) {
                            return {
                                key: item.extension,
                                value: item.extension,
                                label: item.vmgroup_name
                            }
                        })

                    accountList = accountList.map(function(item) {
                            return {
                                    key: item.extension,
                                    value: item.extension,
                                    out_of_service: item.out_of_service,
                                    label: (item.extension +
                                            (item.fullname ? ' "' + item.fullname + '"' : '') +
                                            (item.out_of_service === 'yes' ? ' <' + Disabled + '>' : ''))
                                }
                        })

                    voicemailList = voicemailList.map(function(item) {
                            return {
                                    key: item.extension,
                                    value: item.extension,
                                    out_of_service: item.out_of_service,
                                    label: (item.extension +
                                            (item.fullname ? ' "' + item.fullname + '"' : '') +
                                            (item.out_of_service === 'yes' ? ' <' + Disabled + '>' : ''))
                                }
                        })

                    ringgroupList = ringgroupList.map(function(item) {
                            return {
                                key: item.extension,
                                value: item.extension,
                                label: item.ringgroup_name
                            }
                        })

                    mohNameList = response.getMOHNameList.moh_name || ['default', 'ringbacktone_default']
                    memberAccountList = _.filter(accountList, (data) => { return data.value !== currentExtension })

                    destinationListDataSource = {
                            ivr: ivrList,
                            queue: queueList,
                            account: accountList,
                            voicemail: voicemailList,
                            ringgroup: ringgroupList,
                            vmgroup: vmgroupList,
                            external_number: []
                        }

                    this.setState({
                        mohNameList: mohNameList,
                        memberAccountList: memberAccountList,
                        destinationListDataSource: destinationListDataSource
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (currentExtension) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    action: 'getFollowme',
                    followme: currentExtension
                },
                success: function(res) {
                    // const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    // if (bool) {
                    if (res.status === 0) {
                        const response = res.response || {}
                        const followme = res.response.followme || {}
                        const members = followme.members

                        _.map(followme, (value, key) => {
                            if (value === null) {
                                followmeItem['' + key] = ''
                            } else {
                                followmeItem['' + key] = value
                            }
                        })

                        _.map(members, (data, key) => {
                            let extension = data.extension ? data.extension.split(',') : []

                            followmeMembers.push({
                                key: key,
                                extension: extension,
                                ringtime: data.ringtime
                            })
                        })

                        destination_type = followme.destination_type
                        enable_destination = followme.enable_destination === 'yes'

                        if (destination_type === 'voicemail') {
                            destination_value = followme['vm_extension']
                        } else if (destination_type === 'queue') {
                            destination_value = followme['queue_dest']
                        } else {
                            destination_value = followme[destination_type]
                        }

                        this.setState({
                            followmeItem: followmeItem,
                            followmeMembers: followmeMembers,
                            destination_value: destination_value,
                            enable_destination: enable_destination,
                            destination_type: destination_type.replace(/_t/g, '')
                        })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }
    }
    _handleCancel = () => {
        this.props.form.resetFields()
        this._getInitData()
        // browserHistory.push('/user-personal-data/userFollowMe')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const extensionGroupId = this.props.params.id

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        let errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3391" })}}></span>
        let fields = [
                'musicclass',
                'enable_option',
                'external_number',
                'enable_followme',
                'destination_type',
                'bypass_outrt_auth',
                'destination_value',
                'enable_destination'
            ]

        this.props.form.validateFieldsAndScroll(fields, { force: true }, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                if (!this.state.followmeMembers.length) {
                    message.error(errorMessage)

                    return
                }

                message.loading(loadingMessage)

                let action = {}
                let members = []
                let destinationTypeList = ['voicemail', 'account', 'vmgroup', 'ivr', 'ringgroup', 'queue', 'external_number']

                _.map(values, function(value, key) {
                    if (key === 'destination_value') {
                        return false
                    }

                    action[key] = (value !== undefined ? UCMGUI.transCheckboxVal(value) : '')
                })

                if (_.isEmpty(this.state.followmeItem)) {
                    action.action = 'addFollowme'
                    action.extension = this.state.currentExtension
                } else {
                    action.action = 'updateFollowme'
                    action.followme = this.state.currentExtension
                }

                for (let i = 0; i < destinationTypeList.length; i++) {
                    let destinationType = destinationTypeList[i]

                    if (destinationType !== values.destination_type) {
                        if (destinationType === 'queue') {
                            action['queue_dest'] = ''
                        } else if (destinationType === 'voicemail') {
                            action['vm_extension'] = ''
                        } else {
                            action[destinationType] = ''
                        }
                    } else {
                        if (destinationType === 'queue') {
                            action['queue_dest'] = values.destination_value
                        } else if (destinationType === 'voicemail') {
                            action['vm_extension'] = values.destination_value
                        } else if (destinationType === 'external_number') {
                            action[destinationType] = values.external_number
                        } else {
                            action[destinationType] = values.destination_value
                        }
                    }
                }

                _.map(this.state.followmeMembers, (data, key) => {
                    let obj = {
                            'local_extension': [],
                            'outside_extension': [],
                            'ringtime': data.ringtime
                        }

                    let extensions = data.extension

                    _.map(extensions, (value, index) => {
                        if (_.find(this.state.destinationListDataSource.account, (data) => { return data.key === value })) {
                            obj['local_extension'].push(value)
                        } else {
                            obj['outside_extension'].push(value)
                        }
                    })

                    members.push(obj)
                })

                action['members'] = JSON.stringify(members)

                $.ajax({
                    type: 'post',
                    data: action,
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
    _onChangeDesType = (value) => {
        let form = this.props.form
        let destinationList = this.state.destinationListDataSource[value]

        this.setState({
                destination_type: value,
                destination_value: destinationList.length ? destinationList[0].value : ''
            }, () => {
                form.setFieldsValue({
                    external_number: '',
                    destination_value: destinationList.length ? destinationList[0].value : ""
                })
            })
    }
    _onChangeEnableDes = (e) => {
        this.setState({
            enable_destination: e.target.checked
        })
    }
    _onChangeMemberType = (e) => {
        this.setState({
            member_type: e.target.value
        })
    }
    _onChangeRingtime = (key, event) => {
        let followmeMembers = _.clone(this.state.followmeMembers)

        followmeMembers[key].ringtime = event.target.value

        this.setState({
            followmeMembers: followmeMembers
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form

        const settings = this.state.followmeItem || {}

        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        const formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        }

        const radioStyle = {
            height: "30px",
            display: "block",
            lineHeight: "30px"
        }

        const orderRadio = this.state.followmeMembers.length
                            ? <RadioGroup>
                                    <Radio value="after">{ formatMessage({id: "LANG1983"}) }</Radio>
                                    <Radio value="alongWith">{ formatMessage({id: "LANG1984"}) }</Radio>
                                </RadioGroup>
                            : <RadioGroup>
                                    <Radio value="after">{ formatMessage({id: "LANG1983"}) }</Radio>
                                </RadioGroup>

        const columns = [{
                key: 'key',
                dataIndex: 'key',
                title: formatMessage({id: "LANG85"}),
                render: (text, record, index) => (
                    this._createExtension(text, record, index)
                )
            }, { 
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => (
                    this._createOption(text, record, index)
                )
            }]

        const title = formatMessage({id: "LANG710"})

        document.title = formatMessage({id: "LANG584"}, {
                    0: formatMessage({id: "LANG82"}),
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
                        <Row>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1980" /> }>
                                                <span>{ formatMessage({id: "LANG274"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('enable_followme', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.enable_followme === 'yes'
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG4043" /> }>
                                                <span>{ formatMessage({id: "LANG1142"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('bypass_outrt_auth', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.bypass_outrt_auth === 'yes'
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1977" /> }>
                                                <span>{ formatMessage({id: "LANG1976"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('musicclass', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        initialValue: settings.musicclass ? settings.musicclass : 'default'
                                    })(
                                        <Select>
                                            {
                                                this.state.mohNameList.map(function(value) {
                                                    return <Option
                                                                key={ value }
                                                                value={ value }
                                                            >
                                                                { value }
                                                            </Option>
                                                })
                                            }
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG4092" /> }>
                                                <span>{ formatMessage({id: "LANG4091"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('enable_option', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.enable_option === 'yes'
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG2990" /> }>
                                                <span>{ formatMessage({id: "LANG2990"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('enable_destination', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: this.state.enable_destination
                                    })(
                                        <Checkbox onChange={ this._onChangeEnableDes } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 24 }>
                                <Col span={ 12 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG4276" /> }>
                                                    <span>{ formatMessage({id: "LANG1558"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('destination_type', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: this.state.enable_destination,
                                                message: formatMessage({id: "LANG2150"})
                                            }],
                                            initialValue: this.state.destination_type
                                        })(
                                            <Select
                                                onChange={ this._onChangeDesType }
                                                disabled={ !this.state.enable_destination }
                                            >
                                                <Option value='account'>{ formatMessage({id: "LANG85"}) }</Option>
                                                <Option value='voicemail'>{ formatMessage({id: "LANG90"}) }</Option>
                                                <Option value='queue'>{ formatMessage({id: "LANG91"}) }</Option>
                                                <Option value='ringgroup'>{ formatMessage({id: "LANG600"}) }</Option>
                                                <Option value='vmgroup'>{ formatMessage({id: "LANG89"}) }</Option>
                                                <Option value='ivr'>{ formatMessage({id: "LANG19"}) }</Option>
                                                <Option value='external_number'>{ formatMessage({id: "LANG3458"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col
                                    span={ 6 }
                                    className={ this.state.destination_type !== 'external_number' ? 'display-block' : 'hidden' }
                                >
                                    <FormItem>
                                        { getFieldDecorator('destination_value', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: this.state.enable_destination && this.state.destination_type !== 'external_number',
                                                message: formatMessage({id: "LANG2150"})
                                            }],
                                            initialValue: this.state.destination_value
                                        })(
                                            <Select disabled={ !this.state.enable_destination }>
                                                {
                                                    this.state.destinationListDataSource[this.state.destination_type].map(function(obj) {
                                                            return <Option
                                                                        key={ obj.key }
                                                                        value={ obj.value }
                                                                        className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }
                                                                    >
                                                                        { obj.label }
                                                                    </Option>
                                                        })
                                                }
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col
                                    span={ 6 }
                                    className={ this.state.destination_type === 'external_number' ? 'display-block' : 'hidden' }
                                >
                                    <FormItem>
                                        { getFieldDecorator('external_number', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: this.state.enable_destination && this.state.destination_type === 'external_number',
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.enable_destination && this.state.destination_type === 'external_number' ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage) : callback()
                                                }
                                            }],
                                            initialValue: settings.external_number
                                        })(
                                            <Input disabled={ !this.state.enable_destination } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG711"}) }</span>
                                </div>
                            </Col>
                            <Col
                                span={ 24 }
                            >
                                <FormItem
                                    { ...formItemLayoutRow }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1979" /> }>
                                                <span>{ formatMessage({id: "LANG1978"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('member_type', {
                                        initialValue: 'local'
                                    })(
                                        <RadioGroup onChange={ this._onChangeMemberType }>
                                            <Radio value="local">{ formatMessage({id: "LANG1981"}) }</Radio>
                                            <Radio value="external">{ formatMessage({id: "LANG1982"}) }</Radio>
                                        </RadioGroup>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 24 }
                            >
                                <Col
                                    span={ 4 }
                                    offset={ 4 }
                                    className={ this.state.member_type === 'local' ? 'display-block' : 'hidden' }
                                >
                                    <FormItem>
                                        { getFieldDecorator('member_local', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: this.state.member_type === 'local',
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.member_type === 'local' ? this._checkMemberConflict(data, value, callback) : callback()
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Select>
                                                {
                                                    this.state.memberAccountList.map(function(obj) {
                                                            return <Option
                                                                        key={ obj.key }
                                                                        value={ obj.value }
                                                                        className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }
                                                                    >
                                                                        { obj.label }
                                                                    </Option>
                                                        })
                                                }
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col
                                    span={ 4 }
                                    offset={ 4 }
                                    className={ this.state.member_type === 'external' ? 'display-block' : 'hidden' }
                                >
                                    <FormItem>
                                        { getFieldDecorator('member_external', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: this.state.member_type === 'external',
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.member_type === 'external' ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.member_type === 'external' ? this._checkMemberConflict(data, value, callback) : callback()
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input />
                                        ) }
                                    </FormItem>
                                </Col>
                                <FormItem style={{ float: 'left', display: 'inline-block' }}>
                                    <span style={{ 'padding': '0 10px' }}>{ formatMessage({id: "LANG569"}) }</span>
                                </FormItem>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('member_ringtime', {
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
                                                validator: (data, value, callback) => {
                                                    Validator.range(data, value, callback, formatMessage, 10, 60)
                                                }
                                            }],
                                            initialValue: '30'
                                        })(
                                            <Input />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <FormItem>
                                        <span style={{ 'padding': '0 5px' }}>{ formatMessage({id: "LANG570"}) }</span>
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col
                                span={ 24 }
                            >
                                <FormItem
                                    { ...formItemLayoutRow }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1975" /> }>
                                                <span>{ formatMessage({id: "LANG1974"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('member_order', {
                                        initialValue: 'after'
                                    })(
                                        orderRadio
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 24 } style={{ 'padding': '10px 0' }}>
                                <Col
                                    span={ 4 }
                                    offset={ 4 }
                                >
                                    <Button
                                        icon="plus"
                                        type="primary"
                                        onClick={ this._addMembers }
                                    >
                                        { formatMessage({id: "LANG769"}) }
                                    </Button>
                                </Col>
                            </Col>
                            <Col span={ 24 } style={{ 'margin': '10px 0 0 0' }}>
                                <Table
                                    rowKey="key"
                                    columns={ columns }
                                    pagination={ false }
                                    showHeader={ false }
                                    dataSource={ this.state.followmeMembers }
                                />
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(FollowMe))

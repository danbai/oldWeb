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
import { Checkbox, Col, Form, Input, Icon, message, Row, Select, Tabs, Transfer, Tooltip } from 'antd'

import PresenceStatus from './presenceStatus'

const FormItem = Form.Item
const Option = Select.Option
const TabPane = Tabs.TabPane

class Feature extends Component {
    constructor(props) {
        super(props)

        let cc_mode = 'normal'
        let enable_cc = false
        let settings = this.props.settings

        let dnd = settings.dnd === 'yes'
        let strategy_ipacl = settings.strategy_ipacl
        let presence_status = settings.presence_status
        let en_hotline = settings.en_hotline === 'yes'
        let en_ringboth = settings.en_ringboth === 'yes'
        let enablehotdesk = settings.enablehotdesk === 'yes'
        let bypass_outrt_auth = settings.bypass_outrt_auth
        let callbarging_monitor = settings.callbarging_monitor
        let out_limitime = settings.limitime ? true : false
        let seamless_transfer_members = settings.seamless_transfer_members
        let activeKey = (!settings.presence_status || settings.presence_status === 'dnd') ? 'available' : settings.presence_status

        if (settings.cc_agent_policy && settings.cc_agent_policy === 'generic') {
            enable_cc = true

            cc_mode = 'normal'
        } else if (settings.cc_agent_policy && settings.cc_agent_policy === 'native') {
            enable_cc = true

            cc_mode = 'trunk'
        }

        this.state = {
            dnd: dnd,
            cc_mode: cc_mode,
            activeKey: activeKey,
            enable_cc: enable_cc,
            en_hotline: en_hotline,
            en_ringboth: en_ringboth,
            out_limitime: out_limitime,
            enablehotdesk: enablehotdesk,
            bypass_outrt_auth: bypass_outrt_auth,
            strategy_ipacl: strategy_ipacl ? strategy_ipacl + '' : '0',
            presence_status: presence_status ? presence_status : 'available',
            targetKeysCallbarging: callbarging_monitor ? callbarging_monitor.split(',') : [],
            targetKeysSeamless: seamless_transfer_members ? seamless_transfer_members.split(',') : []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    _addWhiteList = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        // can use data-binding to get
        const whiteLists = form.getFieldValue('whiteLists')

        if (whiteLists.length <= 8) {
            const newWhiteLists = whiteLists.concat(this._generateWhiteListID(whiteLists))

            // can use data-binding to set
            // important! notify form to detect changes
            form.setFieldsValue({
                whiteLists: newWhiteLists
            })
        } else {
            message.warning(formatMessage({id: "LANG809"}, {
                    0: '',
                    1: 10
                }))

            return false
        }
    }
    _addFWDWhiteList = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        // can use data-binding to get
        const fwdwhiteLists = form.getFieldValue('fwdwhiteLists')

        if (fwdwhiteLists.length <= 8) {
            const newFWDWhiteLists = fwdwhiteLists.concat(this._generateWhiteListID(fwdwhiteLists))

            // can use data-binding to set
            // important! notify form to detect changes
            form.setFieldsValue({
                fwdwhiteLists: newFWDWhiteLists
            })
        } else {
            message.warning(formatMessage({id: "LANG809"}, {
                    0: '',
                    1: 10
                }))

            return false
        }
    }
    _checkDNDWhitelist = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let error = false

        if (val) {
            $('input.dnd-whiteLists').each(function() {
                if (this.id === data.field) {
                    return true
                }

                if (this.value === val) {
                    error = true
                    return false
                }
            })
        }

        if (error) {
            callback(formatMessage({id: "LANG5211"}))
        } else {
            callback()
        }
    }
    _checkFWDWhitelist = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let error = false

        if (val) {
            $('input.fwd-whiteLists').each(function() {
                if (this.id === data.field) {
                    return true
                }

                if (this.value === val) {
                    error = true
                    return false
                }
            })
        }

        if (error) {
            callback(formatMessage({id: "LANG5615"}))
        } else {
            callback()
        }
    }
    _checkTimeLarger = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let oGeneral

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getGeneralPrefSettings'
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    oGeneral = data.response.general_pref_settings
                }
            }
        })

        let maximumTime = parseInt(val, 10) * 1000,
            repeattime = parseInt(oGeneral.repeattime, 10),
            warningtime = parseInt(oGeneral.warningtime, 10),
            error = true

        if (!isNaN(warningtime)) {
            if (!isNaN(repeattime)) {
                if (maximumTime > warningtime && warningtime > repeattime) {
                    error = false
                }
            } else if (maximumTime > warningtime) {
                error = false
            }
        } else {
            if (isNaN(repeattime)) {
                error = false
            } else if (maximumTime > repeattime) {
                error = false
            }
        }

        if (error) {
            callback(formatMessage({id: "LANG4346"}))
        } else {
            callback()
        }
    }
    _filterCodecsSource = () => {
        let currentEditId = this.props.currentEditId
        let accountList = _.clone(this.props.destinationDataSource.account)

        if (currentEditId) {
            return _.filter(accountList, function(item) {
                    return item.key !== currentEditId
                })
        } else {
            return accountList
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.label.indexOf(inputValue) > -1)
    }
    _generateWhiteListID = (existIDs) => {
        let newID = 2
        const keyList = _.pluck(existIDs, 'key')

        if (keyList && keyList.length) {
            newID = _.find([2, 3, 4, 5, 6, 7, 8, 9, 10], function(key) {
                    return !_.contains(keyList, key)
                })
        }

        return {
                new: true,
                key: newID
            }
    }
    _handleCallbargingChange = (targetKeys, direction, moveKeys) => {
        const { form } = this.props

        this.setState({
            targetKeysCallbarging: targetKeys
        })

        form.setFieldsValue({
            callbarging_monitor: targetKeys.toString()
        })

        console.log('targetKeys: ', targetKeys)
        console.log('direction: ', direction)
        console.log('moveKeys: ', moveKeys)
    }
    _handleSeamlessChange = (targetKeys, direction, moveKeys) => {
        const { form } = this.props

        this.setState({
            targetKeysSeamless: targetKeys
        })

        form.setFieldsValue({
            seamless_transfer_members: targetKeys.toString()
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
    _onChangeCCMode = (value) => {
        this.setState({
            cc_mode: value
        })
    }
    _onChangeDND = (e) => {
        const { form } = this.props

        let checked = e.target.checked,
            activeKey = this.state.activeKey

        this.setState({
                dnd: e.target.checked,
                presence_status: checked ? 'dnd' : activeKey
            }, () => {
                form.setFieldsValue({
                    presence_status: checked ? 'dnd' : activeKey
                })
            })
    }
    _onChangeEnableCC = (e) => {
        this.setState({
            enable_cc: e.target.checked
        })
    }
    _onChangeHotdesk = (e) => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let enablehotdesk = e.target.checked
        let secret = form.getFieldValue('secret')
        let extension = form.getFieldValue('extension')

        if (enablehotdesk && !secret.match(/^[a-zA-Z0-9]+$/i)) {
            enablehotdesk = false

            message.warning(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4808" })}}></span>)
        }

        this.setState({
                enablehotdesk: enablehotdesk
            }, () => {
                if (enablehotdesk) {
                    form.setFieldsValue({
                        'authid': extension
                    })
                } else {
                    form.setFieldsValue({
                        'enablehotdesk': false
                    })
                }
            })
    }
    _onChangeHotLine = (e) => {
        this.setState({
            en_hotline: e.target.checked
        })
    }
    _onChangeLimiTime = (e) => {
        this.setState({
            out_limitime: e.target.checked
        })
    }
    _onChangePresenceStatus = (value) => {
        const { form } = this.props

        let dnd = (value === 'dnd'),
            activeKey = this.state.activeKey

        if (value !== 'dnd') {
            activeKey = value
        }

        this.setState({
                dnd: dnd,
                activeKey: activeKey,
                presence_status: value
            }, () => {
                form.setFieldsValue({
                    dnd: dnd
                })
            })
    }
    _onChangeRingBoth = (e) => {
        this.setState({
            en_ringboth: e.target.checked
        })
    }
    _onChangeStrategy = (value) => {
        this.setState({
            strategy_ipacl: value
        })
    }
    _onChangeTab = (activeKey) => {
        const { form } = this.props

        this.setState({
                dnd: false,
                activeKey: activeKey,
                presence_status: activeKey
            }, () => {
                form.setFieldsValue({
                    dnd: false,
                    presence_status: activeKey
                })
            })
    }
    _onChangeTrunkAuth = (value) => {
        this.setState({
            bypass_outrt_auth: value
        })
    }
    _onFocus = (e) => {
        e.preventDefault()

        const form = this.props.form

        form.validateFields([e.target.id], { force: true })
    }
    _renderItem = (item) => {
        const customLabel = (
                <span className={ item.out_of_service === 'yes' ? 'out-of-service' : '' }>
                    { item.label }
                </span>
            )

        return {
                label: customLabel,  // for displayed item
                value: item.value   // for title and filter matching
            }
    }
    _removeWhiteList = (k) => {
        let fieldsValue = {}
        const { form } = this.props
        // can use data-binding to get
        const whiteLists = form.getFieldValue('whiteLists')

        fieldsValue['whitelist' + k] = ''
        fieldsValue.whiteLists = whiteLists.filter(item => item.key !== k)

        // can use data-binding to set
        form.setFieldsValue(fieldsValue)
    }
    _removeFWDWhiteList = (k) => {
        let fieldsValue = {}
        const { form } = this.props
        // can use data-binding to get
        const fwdwhiteLists = form.getFieldValue('fwdwhiteLists')

        fieldsValue['fwdwhitelist' + k] = ''
        fieldsValue.fwdwhiteLists = fwdwhiteLists.filter(item => item.key !== k)

        // can use data-binding to set
        form.setFieldsValue(fieldsValue)
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form

        const whiteListIds = []
        const fwdwhiteListIds = []
        const addMethod = this.props.addMethod
        const settings = this.props.settings || {}
        const currentEditId = this.props.currentEditId
        const extension_type = this.props.extensionType
        const callbarging_monitor = settings.callbarging_monitor
        const presenceSettings = settings.presence_settings || []
        const seamless_transfer_members = settings.seamless_transfer_members
        const dndwhitelist = settings.dndwhitelist ? settings.dndwhitelist.split(',') : []
        const fwdwhitelist = settings.fwdwhitelist ? settings.fwdwhitelist.split(',') : []

        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        const formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemLayoutTransfer = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 }
        }

        _.map(dndwhitelist, function(value, key) {
            if (key > 0) {
                whiteListIds.push({
                    key: parseInt(key + 1)
                })
            }
        })

        _.map(fwdwhitelist, function(value, key) {
            if (key > 0) {
                fwdwhiteListIds.push({
                    key: parseInt(key + 1)
                })
            }
        })

        getFieldDecorator('whiteLists', { initialValue: whiteListIds })
        getFieldDecorator('fwdwhiteLists', { initialValue: fwdwhiteListIds })
        getFieldDecorator('callbarging_monitor', { initialValue: callbarging_monitor })
        getFieldDecorator('seamless_transfer_members', { initialValue: seamless_transfer_members })

        const whiteLists = getFieldValue('whiteLists')
        const whiteListFormItems = whiteLists.map((item, index) => {
            return (
                <Col
                    span={ 24 }
                    key={ item.key }
                    className={ this.state.dnd ? 'display-block' : 'hidden' }
                >
                    <FormItem
                        { ...formItemLayoutRow }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5177" /> }>
                                    <span>{ formatMessage({id: "LANG5178"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator(`whitelist${item.key}`, {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    this.state.dnd ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage) : callback()
                                }
                            }, {
                                validator: this.state.dnd ? this._checkDNDWhitelist : ''
                            }],
                            initialValue: item.new ? '' : dndwhitelist[item.key - 1],
                            className: this.state.dnd ? 'display-block' : 'hidden'
                        })(
                            <Input className="dnd-whiteLists" />
                        ) }
                        <Icon
                            type="minus-circle-o"
                            onClick={ () => this._removeWhiteList(item.key) }
                            className="dynamic-network-button"
                        />
                    </FormItem>
                </Col>
            )
        })

        const fwdwhiteLists = getFieldValue('fwdwhiteLists')
        const fwdwhiteListFormItems = fwdwhiteLists.map((item, index) => {
            return (
                <Col
                    span={ 24 }
                    key={ item.key }
                >
                    <FormItem
                        { ...formItemLayoutRow }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5470" /> }>
                                    <span>{ formatMessage({id: "LANG5469"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator(`fwdwhitelist${item.key}`, {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.phoneNumberOrExtension(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: this._checkFWDWhitelist
                            }],
                            initialValue: item.new ? '' : fwdwhitelist[item.key - 1]
                        })(
                            <Input className="fwd-whiteLists" />
                        ) }
                        <Icon
                            type="minus-circle-o"
                            onClick={ () => this._removeFWDWhiteList(item.key) }
                            className="dynamic-network-button"
                        />
                    </FormItem>
                </Col>
            )
        })

        return (
            <div className="content">
                <div className="ant-form">
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG3887"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="row-section-content">
                        <Row
                            className={ extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG5452" /> }>
                                                <span>{ formatMessage({id: "LANG5450"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('presence_status', {
                                        rules: [],
                                        initialValue: this.state.presence_status,
                                        className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Select onChange={ this._onChangePresenceStatus }>
                                            <Option value='available'>{ formatMessage({id: "LANG116"}) }</Option>
                                            <Option value='away'>{ formatMessage({id: "LANG5453"}) }</Option>
                                            <Option value='chat'>{ formatMessage({id: "LANG5465"}) }</Option>
                                            <Option value='dnd'>{ formatMessage({id: "LANG4768"}) }</Option>
                                            <Option value='userdef'>{ formatMessage({id: "LANG5451"}) }</Option>
                                            <Option value='unavailable'>{ formatMessage({id: "LANG113"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ (extension_type === 'sip' && this.state.presence_status === 'userdef') ? 'display-block' : 'hidden' }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG5451" /> }>
                                                <span>{ formatMessage({id: "LANG5451"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('presence_def_script', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: (extension_type === 'sip' && this.state.presence_status === 'userdef'),
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                (extension_type === 'sip' && this.state.presence_status === 'userdef') ? Validator.authid(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                (extension_type === 'sip' && this.state.presence_status === 'userdef') ? Validator.maxlength(data, value, callback, formatMessage, 64) : callback()
                                            }
                                        }],
                                        initialValue: settings.presence_def_script,
                                        className: (extension_type === 'sip' && this.state.presence_status === 'userdef') ? 'display-block' : 'hidden'
                                    })(
                                        <Input max={ 64 } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 24 }>
                                <Tabs type="card" className="custom-tabs" activeKey={ this.state.activeKey } onChange={ this._onChangeTab }>
                                    <TabPane tab={ formatMessage({id: "LANG116"}) } key="available">
                                        <PresenceStatus
                                            form={ form }
                                            extensionType={ extension_type }
                                            presenceStatusType={ 'available' }
                                            presenceSettings={ presenceSettings }
                                            destinationDataSource={ this.props.destinationDataSource }
                                        />
                                    </TabPane>
                                    <TabPane tab={ formatMessage({id: "LANG5453"}) } key="away">
                                        <PresenceStatus
                                            form={ form }
                                            extensionType={ extension_type }
                                            presenceStatusType={ 'away' }
                                            presenceSettings={ presenceSettings }
                                            destinationDataSource={ this.props.destinationDataSource }
                                        />
                                    </TabPane>
                                    <TabPane tab={ formatMessage({id: "LANG5465"}) } key="chat">
                                        <PresenceStatus
                                            form={ form }
                                            extensionType={ extension_type }
                                            presenceStatusType={ 'chat' }
                                            presenceSettings={ presenceSettings }
                                            destinationDataSource={ this.props.destinationDataSource }
                                        />
                                    </TabPane>
                                    {/* <TabPane tab={ formatMessage({id: "LANG4768"}) } key="dnd">
                                        <PresenceStatus
                                            form={ form }
                                            extensionType={ extension_type }
                                            presenceStatusType={ 'dnd' }
                                            presenceSettings={ presenceSettings }
                                            destinationDataSource={ this.props.destinationDataSource }
                                        />
                                    </TabPane> */}
                                    <TabPane tab={ formatMessage({id: "LANG5451"}) } key="userdef">
                                        <PresenceStatus
                                            form={ form }
                                            extensionType={ extension_type }
                                            presenceStatusType={ 'userdef' }
                                            presenceSettings={ presenceSettings }
                                            destinationDataSource={ this.props.destinationDataSource }
                                        />
                                    </TabPane>
                                    <TabPane tab={ formatMessage({id: "LANG113"}) } key="unavailable">
                                        <PresenceStatus
                                            form={ form }
                                            extensionType={ extension_type }
                                            presenceStatusType={ 'unavailable' }
                                            presenceSettings={ presenceSettings }
                                            destinationDataSource={ this.props.destinationDataSource }
                                        />
                                    </TabPane>
                                </Tabs>
                            </Col>
                        </Row>
                        <Row
                            className={ extension_type !== 'sip' ? 'display-block' : 'hidden' }
                        >
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1084" /> }>
                                                <span>{ formatMessage({id: "LANG1083"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('cfu', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                extension_type !== 'sip' ? Validator.numeric_pound_star(data, value, callback, formatMessage) : callback()
                                            }
                                        }],
                                        initialValue: settings.cfu,
                                        className: extension_type !== 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3374" /> }>
                                                <span>{ formatMessage({id: "LANG3371"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('cfu_timetype', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.cfu_timetype ? settings.cfu_timetype + '' : '0',
                                        className: extension_type !== 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Select>
                                            <Option value='0'>{ formatMessage({id: "LANG3285"}) }</Option>
                                            <Option value='1'>{ formatMessage({id: "LANG3271"}) }</Option>
                                            <Option value='2'>{ formatMessage({id: "LANG3275"}) }</Option>
                                            <Option value='3'>{ formatMessage({id: "LANG3266"}) }</Option>
                                            <Option value='4'>{ formatMessage({id: "LANG3286"}) }</Option>
                                            <Option value='5'>{ formatMessage({id: "LANG3287"}) }</Option>
                                            <Option value='6'>{ formatMessage({id: "LANG3288"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1086" /> }>
                                                <span>{ formatMessage({id: "LANG1085"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('cfn', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                extension_type !== 'sip' ? Validator.numeric_pound_star(data, value, callback, formatMessage) : callback()
                                            }
                                        }],
                                        initialValue: settings.cfn,
                                        className: extension_type !== 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3375" /> }>
                                                <span>{ formatMessage({id: "LANG3372"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('cfn_timetype', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.cfn_timetype ? settings.cfn_timetype + '' : '0',
                                        className: extension_type !== 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Select>
                                            <Option value='0'>{ formatMessage({id: "LANG3285"}) }</Option>
                                            <Option value='1'>{ formatMessage({id: "LANG3271"}) }</Option>
                                            <Option value='2'>{ formatMessage({id: "LANG3275"}) }</Option>
                                            <Option value='3'>{ formatMessage({id: "LANG3266"}) }</Option>
                                            <Option value='4'>{ formatMessage({id: "LANG3286"}) }</Option>
                                            <Option value='5'>{ formatMessage({id: "LANG3287"}) }</Option>
                                            <Option value='6'>{ formatMessage({id: "LANG3288"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1088" /> }>
                                                <span>{ formatMessage({id: "LANG1087"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('cfb', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                extension_type !== 'sip' ? Validator.numeric_pound_star(data, value, callback, formatMessage) : callback()
                                            }
                                        }],
                                        initialValue: settings.cfb,
                                        className: extension_type !== 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3376" /> }>
                                                <span>{ formatMessage({id: "LANG3373"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('cfb_timetype', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.cfb_timetype ? settings.cfb_timetype + '' : '0',
                                        className: extension_type !== 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Select>
                                            <Option value='0'>{ formatMessage({id: "LANG3285"}) }</Option>
                                            <Option value='1'>{ formatMessage({id: "LANG3271"}) }</Option>
                                            <Option value='2'>{ formatMessage({id: "LANG3275"}) }</Option>
                                            <Option value='3'>{ formatMessage({id: "LANG3266"}) }</Option>
                                            <Option value='4'>{ formatMessage({id: "LANG3286"}) }</Option>
                                            <Option value='5'>{ formatMessage({id: "LANG3287"}) }</Option>
                                            <Option value='6'>{ formatMessage({id: "LANG3288"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5179" /> }>
                                            <span>{ formatMessage({id: "LANG4768"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('dnd', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.dnd
                                })(
                                    <Checkbox onChange={ this._onChangeDND } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5180" /> }>
                                            <span>{ formatMessage({id: "LANG4769"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('dnd_timetype', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: settings.dnd_timetype ? settings.dnd_timetype + '' : '0'
                                })(
                                    <Select disabled={ !this.state.dnd }>
                                        <Option value='0'>{ formatMessage({id: "LANG3285"}) }</Option>
                                        <Option value='1'>{ formatMessage({id: "LANG3271"}) }</Option>
                                        <Option value='2'>{ formatMessage({id: "LANG3275"}) }</Option>
                                        <Option value='3'>{ formatMessage({id: "LANG3266"}) }</Option>
                                        <Option value='4'>{ formatMessage({id: "LANG3286"}) }</Option>
                                        <Option value='5'>{ formatMessage({id: "LANG3287"}) }</Option>
                                        <Option value='6'>{ formatMessage({id: "LANG3288"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 24 }
                            className={ this.state.dnd ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayoutRow }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5177" /> }>
                                            <span>{ formatMessage({id: "LANG5178"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('whitelist1', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.dnd ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: this.state.dnd ? this._checkDNDWhitelist : ''
                                    }],
                                    initialValue: dndwhitelist.length ? dndwhitelist[0] : '',
                                    className: this.state.dnd ? 'display-block' : 'hidden'
                                })(
                                    <Input className="dnd-whiteLists" />
                                ) }
                                <Icon
                                    type="plus-circle-o"
                                    onClick={ this._addWhiteList }
                                    className="dynamic-network-button"
                                />
                            </FormItem>
                        </Col>
                        { whiteListFormItems }
                        <Col span={ 24 }>
                            <FormItem
                                { ...formItemLayoutRow }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5470" /> }>
                                            <span>{ formatMessage({id: "LANG5469"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('fwdwhitelist1', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.phoneNumberOrExtension(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: this._checkFWDWhitelist
                                    }],
                                    initialValue: fwdwhitelist.length ? fwdwhitelist[0] : ''
                                })(
                                    <Input className="fwd-whiteLists" />
                                ) }
                                <Icon
                                    type="plus-circle-o"
                                    onClick={ this._addFWDWhiteList }
                                    className="dynamic-network-button"
                                />
                            </FormItem>
                        </Col>
                        { fwdwhiteListFormItems }
                    </Row>
                    <Row
                        className={ extension_type === 'iax' ? 'hidden' : 'display-block' }
                    >
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG3725"}) }</span>
                            </div>
                        </Col>
                        <Row className="row-section-content">
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3727" /> }>
                                                <span>{ formatMessage({id: "LANG3726"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('enable_cc', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: this.state.enable_cc,
                                        className: extension_type === 'iax' ? 'hidden' : 'display-block'
                                    })(
                                        <Checkbox onChange={ this._onChangeEnableCC } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ this.state.enable_cc && extension_type === 'sip'
                                                ? 'display-block'
                                                : 'hidden'
                                            }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3729" /> }>
                                                <span>{ formatMessage({id: "LANG3728"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('cc_mode', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: this.state.cc_mode,
                                        className: this.state.enable_cc && extension_type === 'sip'
                                                ? 'display-block'
                                                : 'hidden'
                                    })(
                                        <Select onChange={ this._onChangeCCMode } >
                                            <Option value='normal'>Normal</Option>
                                            <Option value='trunk'>For Trunk</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ extension_type === 'sip' && this.state.enable_cc && this.state.cc_mode === 'trunk'
                                                ? 'display-block'
                                                : 'hidden'
                                            }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3734" /> }>
                                                <span>{ formatMessage({id: "LANG3733"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('cc_max_agents', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: (extension_type === 'sip' && this.state.enable_cc && this.state.cc_mode === 'trunk'),
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                (extension_type === 'sip' && this.state.enable_cc && this.state.cc_mode === 'trunk') ? Validator.digits(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                (extension_type === 'sip' && this.state.enable_cc && this.state.cc_mode === 'trunk') ? Validator.range(data, value, callback, formatMessage, 1, 999) : callback()
                                            }
                                        }],
                                        initialValue: settings.cc_max_agents ? settings.cc_max_agents + '' : '10',
                                        className: (extension_type === 'sip' && this.state.enable_cc && this.state.cc_mode === 'trunk')
                                                ? 'display-block'
                                                : 'hidden'
                                    })(
                                        <Input min={ 1 } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ extension_type === 'sip' && this.state.enable_cc && this.state.cc_mode === 'trunk'
                                                ? 'display-block'
                                                : 'hidden'
                                            }
                            >
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3740" /> }>
                                                <span>{ formatMessage({id: "LANG3739"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('cc_max_monitors', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: (extension_type === 'sip' && this.state.enable_cc && this.state.cc_mode === 'trunk'),
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                (extension_type === 'sip' && this.state.enable_cc && this.state.cc_mode === 'trunk') ? Validator.digits(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                (extension_type === 'sip' && this.state.enable_cc && this.state.cc_mode === 'trunk') ? Validator.range(data, value, callback, formatMessage, 1, 999) : callback()
                                            }
                                        }],
                                        initialValue: settings.cc_max_monitors ? settings.cc_max_monitors + '' : '10',
                                        className: (extension_type === 'sip' && this.state.enable_cc && this.state.cc_mode === 'trunk')
                                                ? 'display-block'
                                                : 'hidden'
                                    })(
                                        <Input min={ 1 } />
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                    </Row>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG1062"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="row-section-content">
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3760" /> }>
                                            <span>{ formatMessage({id: "LANG1062"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('en_ringboth', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.en_ringboth ? (settings.en_ringboth === 'yes') : false
                                })(
                                    <Checkbox onChange={ this._onChangeRingBoth } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3761" /> }>
                                            <span>{ formatMessage({id: "LANG3458"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('external_number', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.en_ringboth,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.phoneNumberOrExtension(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 32)
                                        }
                                    }],
                                    initialValue: settings.external_number
                                })(
                                    <Input disabled={ !this.state.en_ringboth } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3763" /> }>
                                            <span>{ formatMessage({id: "LANG3762"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('ringboth_timetype', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: settings.ringboth_timetype ? settings.ringboth_timetype + '' : '0'
                                })(
                                    <Select disabled={ !this.state.en_ringboth }>
                                        <Option value='0'>{ formatMessage({id: "LANG3285"}) }</Option>
                                        <Option value='1'>{ formatMessage({id: "LANG3271"}) }</Option>
                                        <Option value='2'>{ formatMessage({id: "LANG3275"}) }</Option>
                                        <Option value='3'>{ formatMessage({id: "LANG3266"}) }</Option>
                                        <Option value='4'>{ formatMessage({id: "LANG3286"}) }</Option>
                                        <Option value='5'>{ formatMessage({id: "LANG3287"}) }</Option>
                                        <Option value='6'>{ formatMessage({id: "LANG3288"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5472" /> }>
                                            <span>{ formatMessage({id: "LANG5471"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('use_callee_dod_on_fwd_rb', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.use_callee_dod_on_fwd_rb ? (settings.use_callee_dod_on_fwd_rb === 'yes') : false
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row
                        className={ extension_type === 'fxs' ? 'display-block' : 'hidden' }
                    >
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG4182"}) }</span>
                            </div>
                        </Col>
                        <Row className="row-section-content">
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG4183" /> }>
                                                <span>{ formatMessage({id: "LANG4183"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('en_hotline', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.en_hotline ? (settings.en_hotline === 'yes') : false,
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Checkbox onChange={ this._onChangeHotLine } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG4184" /> }>
                                                <span>{ formatMessage({id: "LANG4184"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('hotline_number', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.en_hotline,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.phoneNumberOrExtension(data, value, callback, formatMessage)
                                            }
                                        }],
                                        initialValue: settings.hotline_number,
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Input disabled={ !this.state.en_hotline } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG4188" /> }>
                                                <span>{ formatMessage({id: "LANG4185"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('hotline_type', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.hotline_type ? settings.hotline_type + '' : '1',
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Select disabled={ !this.state.en_hotline }>
                                            <Option value='1'>{ formatMessage({id: "LANG4186"}) }</Option>
                                            <Option value='2'>{ formatMessage({id: "LANG4187"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                    </Row>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG5079"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="row-section-content">
                        <Col
                            span={ 24 }
                        >
                            <FormItem
                                { ...formItemLayoutTransfer }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5081" /> }>
                                            <span>{ formatMessage({id: "LANG5080"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                <Transfer
                                    showSearch
                                    render={ this._renderItem }
                                    dataSource={ this._filterCodecsSource() }
                                    onChange={ this._handleCallbargingChange }
                                    filterOption={ this._filterTransferOption }
                                    targetKeys={ this.state.targetKeysCallbarging }
                                    notFoundContent={ formatMessage({id: "LANG133"}) }
                                    onSelectChange={ this._handleTransferSelectChange }
                                    searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                    titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG5294"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="row-section-content">
                        <Col
                            span={ 24 }
                        >
                            <FormItem
                                { ...formItemLayoutTransfer }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5296" /> }>
                                            <span>{ formatMessage({id: "LANG5295"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                <Transfer
                                    showSearch
                                    render={ this._renderItem }
                                    onChange={ this._handleSeamlessChange }
                                    dataSource={ this._filterCodecsSource() }
                                    filterOption={ this._filterTransferOption }
                                    targetKeys={ this.state.targetKeysSeamless }
                                    notFoundContent={ formatMessage({id: "LANG133"}) }
                                    onSelectChange={ this._handleTransferSelectChange }
                                    searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                    titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG629"}) }</span>
                            </div>
                        </Col>
                    </Row>
                        {/* <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1066" /> }>
                                            <span>{ formatMessage({id: "LANG1065"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('fullname', {
                                    rules: [
                                        {
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }
                                    ],
                                    initialValue: settings.fullname
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ 'TIP_USERS_28' }>
                                            <span>{ 'Trunk Authority Password' }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('trunk_secret', {
                                    rules: [
                                        {
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }
                                    ],
                                    initialValue: settings.trunk_secret
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col> */}
                    <Row className="row-section-content">
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1599" /> }>
                                            <span>{ formatMessage({id: "LANG1598"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('ring_timeout', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.range(data, value, callback, formatMessage, 3, 600)
                                        }
                                    }],
                                    initialValue: settings.ring_timeout
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2544" /> }>
                                            <span>{ formatMessage({id: "LANG2543"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('auto_record', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.auto_record ? (settings.auto_record === 'yes') : false
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        {/* <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ 'TIP_USERS_12' }>
                                            <span>{ 'ADA User' }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('cti', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.cti
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col> */}
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4047" /> }>
                                            <span>{ formatMessage({id: "LANG1142"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('bypass_outrt_auth', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: settings.bypass_outrt_auth ? settings.bypass_outrt_auth : 'no'
                                })(
                                    <Select onChange={ this._onChangeTrunkAuth }>
                                        <Option value='no'>{ formatMessage({id: "LANG137"}) }</Option>
                                        <Option value='yes'>{ formatMessage({id: "LANG136"}) }</Option>
                                        <Option value='bytime'>{ formatMessage({id: "LANG4044"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2747" /> }>
                                            <span>{ formatMessage({id: "LANG2746"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('user_outrt_passwd', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 4)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 10)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.checkNumericPw(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: settings.user_outrt_passwd
                                })(
                                    <Input disabled={ this.state.bypass_outrt_auth === 'yes' } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this.state.bypass_outrt_auth === 'bytime' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4046" /> }>
                                            <span>{ formatMessage({id: "LANG4045"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('skip_auth_timetype', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: settings.skip_auth_timetype ? settings.skip_auth_timetype + '' : '0',
                                    className: this.state.bypass_outrt_auth === 'bytime' ? 'display-block' : 'hidden'
                                })(
                                    <Select>
                                        <Option value='0'>{ formatMessage({id: "LANG3285"}) }</Option>
                                        <Option value='1'>{ formatMessage({id: "LANG3271"}) }</Option>
                                        <Option value='2'>{ formatMessage({id: "LANG3275"}) }</Option>
                                        <Option value='3'>{ formatMessage({id: "LANG3266"}) }</Option>
                                        <Option value='4'>{ formatMessage({id: "LANG3286"}) }</Option>
                                        <Option value='5'>{ formatMessage({id: "LANG3287"}) }</Option>
                                        <Option value='6'>{ formatMessage({id: "LANG3288"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ addMethod === 'single' && extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2690" /> }>
                                            <span>{ formatMessage({id: "LANG2689"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('enablehotdesk', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.enablehotdesk,
                                    className: addMethod === 'single' && extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Checkbox onChange={ this._onChangeHotdesk } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4136" /> }>
                                            <span>{ formatMessage({id: "LANG4135"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('enable_ldap', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.enable_ldap ? (settings.enable_ldap === 'yes') : true
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4452" /> }>
                                            <span>{ formatMessage({id: "LANG4393"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('enable_webrtc', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.enable_webrtc ? (settings.enable_webrtc === 'yes') : false,
                                    className: extension_type === 'sip' ? 'display-block' : 'hidden'
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1800" /> }>
                                            <span>{ formatMessage({id: "LANG1178"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('mohsuggest', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: settings.mohsuggest ? settings.mohsuggest : 'default'
                                })(
                                    <Select>
                                        {
                                            this.props.mohNameList.map(function(value) {
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
                        <Col
                            span={ 12 }
                            className={ !currentEditId && extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4879" /> }>
                                            <span>{ formatMessage({id: "LANG4878"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('room', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.room ? (settings.room === 'yes') : false,
                                    className: extension_type === 'sip' ? 'display-block' : 'hidden'
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3026" /> }>
                                            <span>{ formatMessage({id: "LANG3025"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('out_limitime', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.out_limitime
                                })(
                                    <Checkbox onChange={ this._onChangeLimiTime } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this.state.out_limitime ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3018" /> }>
                                            <span>{ formatMessage({id: "LANG3017"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('maximumTime', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.out_limitime,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.out_limitime ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.out_limitime ? Validator.max(data, value, callback, formatMessage, 86400) : callback()
                                        }
                                    }, {
                                        validator: this.state.out_limitime ? this._checkTimeLarger : ''
                                    }],
                                    initialValue: settings.limitime ? (settings.limitime / 1000) + '' : '',
                                    className: this.state.out_limitime ? 'display-block' : 'hidden'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5049" /> }>
                                            <span>{ formatMessage({id: "LANG5048"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('custom_autoanswer', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.custom_autoanswer ? (settings.custom_autoanswer === 'yes') : false,
                                    className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default injectIntl(Feature)
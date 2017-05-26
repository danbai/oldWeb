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
import { Form, Input, message, Select, Tooltip, Checkbox, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class DateTrunkItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            enableHDLC: false,
            enableFrameRelay: false,
            defaultInterface: false,
            disableDCE: true,
            forbidConnect: false,
            listDigitalGroup: [],
            netHDLCValues: {}
        }
    }
    componentWillMount() {
        this._getNetHDLC()
        this._listDigitalGroup()
    }
    componentDidMount() {
        this._getnethdlcStatus()
        this._getlistDataTrunk()
        this._getlistDigitalTrunk()
        this._getGroupIndex()
        this._getDigitalHardwareSettings()
        this._getInitData()
    }
    _checkLoaclAndRemoteTheSame = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const remoteip = this.props.form.getFieldValue('hdlc0__remoteip')

        if (value && value === remoteip) {
            callback(formatMessage({id: "LANG3263"}, {0: formatMessage({id: "LANG3565"}), 1: formatMessage({id: "LANG3568"})}))
        } else {
            callback()
        }
    }
    _checkRemoteAndLocalTheSame = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const localip = this.props.form.getFieldValue('hdlc0__localip')

        if (value && value === localip) {
            callback(formatMessage({id: "LANG3263"}, {0: formatMessage({id: "LANG3568"}), 1: formatMessage({id: "LANG3565"})}))
        } else {
            callback()
        }
    }

    _getnethdlcStatus = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getnethdlcStatus' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}

                    console.log('getnethdlcStatus is  ', response)
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _getlistDataTrunk = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'listDataTrunk' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}

                    console.log('listDataTrunk is  ', response)
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _getlistDigitalTrunk = () => {

    }

    _getNetHDLC = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getNetHDLC' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    let netHDLCValues = response.nethdlc_settings
                    let defaultInterface = netHDLCValues.hdlc0__default

                    console.log('getNetHDLC is  ', netHDLCValues)
                    this.setState({
                        netHDLCValues: netHDLCValues,
                        defaultInterface: defaultInterface
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _getGroupIndex = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getNetHDLC',
                        group_index: '' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}

                    console.log('getNetHDLC is  ', response)
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _listDigitalGroup = () => {
        let digitalTrunkList = []
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'listDigitalTrunk',
            options: 'trunk_name,group_index' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    digitalTrunkList = response.digital_trunks

                    console.log('listDigitalTrunk is  ', response)
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
                action: 'listDigitalGroup',
                options: 'group_name,group_index'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let disable = false
                    let listDigitalGroup = []
                    let response = res.response || {}
                    let tmpListDigitalGroup = response.digital_group

                    for (let i = 0; i < tmpListDigitalGroup.length; i++) {
                        let groupName = tmpListDigitalGroup[i]["group_name"]
                        let groupIndex = tmpListDigitalGroup[i]["group_index"]
                        for (let ii = 0; ii < digitalTrunkList.length; ii++) {
                            if (groupIndex === parseInt(digitalTrunkList[ii].group_index)) {
                                disable = true
                            } else {
                                disable = false
                            }
                        }
                        if (groupName && groupIndex) {
                            let obj = {
                                idx: groupIndex,
                                name: groupName,
                                disabled: disable
                            }
                            listDigitalGroup.push(obj)
                        }
                    }
                    console.log('listDigitalGroup is  ', listDigitalGroup)
                    this.setState({
                        listDigitalGroup: listDigitalGroup
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _getDigitalHardwareSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getDigitalHardwareSettings',
                        signalling: '' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let __this = this
                    let response = res.response || {}
                    let digitalDriver = response.digital_driver_settings || []

                    digitalDriver.map(function(item) {
                        console.log('getDigitalHardwareSettings is  ', item.signalling)
                        if (item.signalling === "mfcr2" || item.signalling === "em" || item.signalling === "em_w") {
                            __this.setState({
                                forbidConnect: true
                            })
                        }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _getInitData = () => {
        let tmpEnableHDLC = false
        let tmpDisableDCE = false
        let tmpEnableFrameRelay = false
        const netHDLCValues = this.state.netHDLCValues

        if (netHDLCValues.hdlc0__enable === 1) {
            tmpEnableHDLC = true
        }
        if (netHDLCValues.hdlc0__encapsulation === 'fr') {
            tmpEnableFrameRelay = true
        }
        if (netHDLCValues.hdlc0__fr__lmitype === 'none') {
            tmpDisableDCE = true
        }

        this.setState({
            enableHDLC: tmpEnableHDLC,
            disableDCE: tmpDisableDCE,
            enableFrameRelay: tmpEnableFrameRelay
        })
    }

    _handleCancel = () => {
        browserHistory.push('/extension-trunk/dataTrunk')
    }

    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        let __this = this

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = values
                action.hdlc0__default = this.state.defaultInterface ? 1 : 0
                action.hdlc0__enable = this.state.enableHDLC ? 1 : 0
                action.action = 'updateNetHDLC'

                if (action.hdlc0__enable === 0) {
                    action['group_index'] = ''
                }
                console.log('update netDHLC: ', action)
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

                            confirm({
                                content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG927" })}}></span>,
                                okText: formatMessage({id: "LANG727"}),
                                cancelText: formatMessage({id: "LANG726"}),
                                onOk: this._applyChangeAndReboot.bind(this),
                                onCancel: this._cancelReboot.bind(this)
                            })
                        }
                    }.bind(this)
                })
            }
        })
    }

    _onChangeEnableHDLC= (e) => {
        console.log('copy monitor: ', e.target.checked)

        if (e.target.checked) {
            this.setState({
                enableHDLC: true
            })
        } else {
            this.setState({
                enableHDLC: false
            })
        }
    }

    _onChangeChannelGroup = (e) => {
        console.log('copy channel group: ', e)
    }

    _onChangeenCapsulation = (e) => {
        console.log('copy channel group: ', e)
        if (e === 'fr') {
            this.setState({
                enableFrameRelay: true
            })
        } else {
            this.setState({
                enableFrameRelay: false
            })
        }
    }

    _onChangeDefaultInterface= (e) => {
        console.log('copy monitor: ', e.target.checked)

        if (e.target.checked) {
            this.setState({
                defaultInterface: true
            })
        } else {
            this.setState({
                defaultInterface: false
            })
        }
    }

    _onChangeLimitType= (value) => {
        console.log('limit type: ', value)

        if (value !== 'none') {
            this.setState({
                 disableDCE: false
            })
        } else {
            this.setState({
                 disableDCE: true
            })
        }
    }

    _onChangefrType= (value) => {
        console.log('frame relay type: ', value)
    }

    _applyChangeAndReboot = () => {
        const { formatMessage } = this.props.intl

        message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG832" })}}></span>, 0)

        UCMGUI.loginFunction.confirmReboot()
    }

    _cancelReboot = () => {
        this._handleCancel()
    }

    _checkR2AndEM = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const forbidConnect = this.state.forbidConnect

        if (forbidConnect) {
            callback(formatMessage({id: "LANG3985"}))
        } else {
            callback()
        }
    }

    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const title = (formatMessage({id: "LANG3573"}))
        const netHDLCValues = this.state.netHDLCValues
        const digitalGroupList = this.state.listDigitalGroup

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

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
                            ref="div_hdlc0__enable"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3557" />}>
                                    <span>{formatMessage({id: "LANG3556"})}</span>
                                </Tooltip>
                            }>
                                <Checkbox
                                    onChange={ this._onChangeEnableHDLC}
                                    checked={ this.state.enableHDLC }
                                />
                        </FormItem>

                        <FormItem
                            ref="div_group_index"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3145" />}>
                                    <span>{ formatMessage({id: "LANG3162"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('group_index', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkR2AndEM
                                }],
                                width: 100,
                                initialValue: netHDLCValues.group_index ? netHDLCValues.group_index : ''
                            })(
                                <Select disabled = { this.state.enableHDLC ? false : true }>
                                    {
                                        digitalGroupList.map(function(item) {
                                            return <Option disabled = { item.disabled } value={ item.idx }>{ item.name }</Option>
                                            }
                                        )
                                    }
                                </Select>
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_hdlc0__encapsulation"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3559" />}>
                                    <span>{ formatMessage({id: "LANG3558"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('hdlc0__encapsulation', {
                                rules: [],
                                width: 100,
                                initialValue: netHDLCValues.hdlc0__encapsulation ? netHDLCValues.hdlc0__encapsulation : 'hdlc'
                            })(
                                <Select onChange={ this._onChangeenCapsulation } >
                                    <Option value='hdlc'>{ formatMessage({id: "LANG3560"}) }</Option>
                                    <Option value='hdlc-eth'>{ formatMessage({id: "LANG3561"}) }</Option>
                                    <Option value='cisco'>{ formatMessage({id: "LANG3562"}) }</Option>
                                    <Option value='fr'>{ formatMessage({id: "LANG3563"}) }</Option>
                                    <Option value='ppp'>{ formatMessage({id: "LANG3564"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_hdlc0__fr__lmitype"
                            { ...formItemLayout }
                            className= { this.state.enableFrameRelay === true ? 'display-block' : 'hidden' }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3893" />}>
                                    <span>{ formatMessage({id: "LANG3892"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('hdlc0__fr__lmitype', {
                                rules: [],
                                width: 100,
                                initialValue: netHDLCValues.hdlc0__fr__lmitype ? netHDLCValues.hdlc0__fr__lmitype : 'none'
                            })(
                                <Select onChange={ this._onChangeLimitType } >
                                    <Option value='none'>None</Option>
                                    <Option value='ansi'>{ formatMessage({id: "LANG3898"}) }</Option>
                                    <Option value='ccitt'>{ formatMessage({id: "LANG3899"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_hdlc0__fr__dlci"
                            { ...formItemLayout }
                            className= { this.state.enableFrameRelay === true ? 'display-block' : 'hidden' }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3895" />}>
                                    <span>{ formatMessage({id: "LANG3894"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('hdlc0__fr__dlci', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1, 1023)
                                    }
                                }],
                                initialValue: netHDLCValues.hdlc0__fr__dlci ? netHDLCValues.hdlc0__fr__dlci : '16'
                            })(
                                <Input placeholder={ formatMessage({id: "LANG3894"}) } maxLength="25" />
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_hdlc0__fr__dce"
                            { ...formItemLayout }
                            className= { this.state.enableFrameRelay === true ? 'display-block' : 'hidden' }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3897" />}>
                                    <span>{ formatMessage({id: "LANG3896"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('hdlc0__fr__dce', {
                                rules: [],
                                width: 100,
                                initialValue: netHDLCValues.hdlc0__fr__dce === 0 ? '0' : '1'
                            })(
                                <Select disabled = { this.state.disableDCE } onChange = { this._onChangefrType } >
                                    <Option value='0' >DTE</Option>
                                    <Option value='1' >DCE</Option>
                                </Select>
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_hdlc0__localip"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3566" />}>
                                    <span>{ formatMessage({id: "LANG3565"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('hdlc0__localip', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.ipDns(data, value, callback, formatMessage, "IP")
                                    }
                                }, {
                                    validator: this._checkLoaclAndRemoteTheSame
                                }],
                                initialValue: netHDLCValues.hdlc0__localip ? netHDLCValues.hdlc0__localip : '10.10.10.10'
                            })(
                                <Input placeholder={ formatMessage({id: "LANG3565"}) } maxLength="25" />
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_hdlc0__netmask"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3567" />}>
                                    <span>{ formatMessage({id: "LANG1902"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('hdlc0__netmask', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.mask(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: netHDLCValues.hdlc0__netmask ? netHDLCValues.hdlc0__netmask : '255.255.255.0'
                            })(
                                <Input placeholder={ formatMessage({id: "LANG1902"}) } maxLength="25" />
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_hdlc0__remoteip"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3569" />}>
                                    <span>{ formatMessage({id: "LANG3568"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('hdlc0__remoteip', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.ipDns(data, value, callback, formatMessage, "IP")
                                    }
                                }, {
                                    validator: this._checkRemoteAndLocalTheSame
                                }],
                                initialValue: netHDLCValues.hdlc0__remoteip ? netHDLCValues.hdlc0__remoteip : '10.10.10.11'
                            })(
                                <Input placeholder={ formatMessage({id: "LANG3568"}) } maxLength="25" />
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_hdlc0__dns1"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1905" />}>
                                    <span>{ formatMessage({id: "LANG1904"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('hdlc0__dns1', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.ipDns(data, value, callback, formatMessage, formatMessage({id: "LANG579"}))
                                    }
                                }],
                                initialValue: netHDLCValues.hdlc0__dns1 ? netHDLCValues.hdlc0__dns1 : '0.0.0.0'
                            })(
                                <Input placeholder={ formatMessage({id: "LANG1904"}) } maxLength="25" />
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_hdlc0__dns2"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1907" />}>
                                    <span>{ formatMessage({id: "LANG1906"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('hdlc0__dns2', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.ipDns(data, value, callback, formatMessage, formatMessage({id: "LANG579"}))
                                    }
                                }],
                                initialValue: netHDLCValues.hdlc0__dns2 ? netHDLCValues.hdlc0__dns2 : ''
                            })(
                                <Input placeholder={ formatMessage({id: "LANG1906"}) } maxLength="25" />
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_hdlc0__default"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3571" />}>
                                    <span>{formatMessage({id: "LANG3570"})}</span>
                                </Tooltip>
                            }>
                                <Checkbox
                                    onChange={ this._onChangeDefaultInterface }
                                    checked={ this.state.defaultInterface }
                                />
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(DateTrunkItem))

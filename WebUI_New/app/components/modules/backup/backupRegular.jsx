'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl, formatMessage } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip, Modal, Button } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const CheckboxGroup = Checkbox.Group
var enableVoiceRecord = false

class BackupRegular extends Component {
    constructor(props) {
        super(props)
        this.state = {
            settings: {},
            storageList: [],
            plainOptions: [],
            checkedList: [],
            dialList: [
                'config',
                'cdr',
                'voice_record',
                'vfax',
                'voicemail_file',
                'voice_file',
                'storage'
            ],
            dialAll: false
        }
    }
    componentWillMount() {
        this._getInitData()
    }
    componentDidMount() {

    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const plainOptions = [{
            label: formatMessage({id: "LANG4052"}),
            value: 'config'
        }, {
            label: formatMessage({id: "LANG4053"}),
            value: 'cdr'
        }, {
            label: formatMessage({id: "LANG2640"}),
            value: 'voice_record'
        }, {
            label: formatMessage({id: "LANG2988"}),
            value: 'vfax'
        }, {
            label: formatMessage({id: "LANG2379"}),
            value: 'voicemail_file'
        }, {
            label: formatMessage({id: "LANG4054"}),
            value: 'voice_file'
        }, {
            label: formatMessage({id: "LANG4115"}),
            value: 'storage'
        }]

        let storageList = this.state.storageList || []
        let storageValueList = []   
        let checkedList = this.state.checkedList || []
        let dialAll = this.state.dialAll
        let settings = {}
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getBackupSettings',
                type: "regular"
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                     _.each(response.type, function(num, key) {
                        if (key === 'enable_regular') {
                            settings[key] = num === "yes" ? true : false
                        } else {
                            settings[key] = num
                        }
                    })
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
                action: 'getInterfaceStatus'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    let bSd = response['interface-sdcard']
                    let bUsb = response['interface-usbdisk']
                    let obj = {}
                    if (bSd === 'true') {
                        obj = { 
                            text: formatMessage({id: "LANG262"}),
                            val: "sd"
                        }
                        storageList.push(obj)
                        storageValueList.push("sd")
                    }
                    if (bUsb === 'true') {
                        obj = { 
                            text: formatMessage({id: "LANG263"}),
                            val: "usb"
                        }
                        storageList.push(obj)
                        storageValueList.push("usb")
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        checkedList = []
        this.state.dialList.map(function(item) {
            if (settings[item] === 'yes') {
                checkedList.push(item)
            }
        })

        dialAll = checkedList.length === plainOptions.length
        if (_.indexOf(checkedList, "voice_record") > -1) {
            enableVoiceRecord = true
        }
        if (_.indexOf(storageValueList, settings.location) === -1) {
            settings.location = "network"
        }

        // this.props.getSpecialState(checkedList)
        this.setState({
            settings: settings,
            storageList: storageList,
            checkedList: checkedList,
            dialAll: dialAll,
            plainOptions: plainOptions
        })
    }
    _onChangeAddMethod = (value) => {
        this.setState({
            add_method: value
        })
    }
    _onFocus = (e) => {
        e.preventDefault()

        const form = this.props.form

        form.validateFields([e.target.id], { force: true })
    }
    _onChangeDial = (checkedList) => {
        const plainOptions = this.state.plainOptions
        const { formatMessage } = this.props.intl
        if (_.indexOf(checkedList, "voice_record") > -1 && enableVoiceRecord === false) {
            Modal.confirm({
                content: formatMessage({id: "LANG2642"}),
                okText: formatMessage({id: 'LANG727'}),
                cancelText: formatMessage({id: 'LANG726'}),
                onOk: () => {
                    enableVoiceRecord = true
                    this.setState({
                        checkedList: checkedList,
                        dialAll: checkedList.length === plainOptions.length
                    })
                },
                onCancel: () => {
                    checkedList = _.without(checkedList, "voice_record")
                    this.setState({
                        checkedList: checkedList,
                        dialAll: checkedList.length === plainOptions.length
                    })
                }
            })
        } else {
            enableVoiceRecord = _.indexOf(checkedList, "voice_record") === -1 ? false : true
            this.setState({
                checkedList: checkedList,
                dialAll: checkedList.length === plainOptions.length
            })
        }
        // this.props.getSpecialState(checkedList)
    }
    _onDialallChange = (e) => {
        let checkedList = []
        const plainOptions = this.state.plainOptions
        const { formatMessage } = this.props.intl
        plainOptions.map(function(item) {
            checkedList.push(item.value)
        })
        if (enableVoiceRecord === false) {
            Modal.confirm({
                content: formatMessage({id: "LANG2642"}),
                okText: formatMessage({id: 'LANG727'}),
                cancelText: formatMessage({id: 'LANG726'}),
                onOk: () => {
                    enableVoiceRecord = true
                    this.setState({
                        checkedList: checkedList,
                        dialAll: e.target.checked
                    })
                },
                onCancel: () => {
                    checkedList = _.without(checkedList, "voice_record")
                    this.setState({
                        checkedList: [],
                        dialAll: false
                    })
                }
            })
        } else {
            enableVoiceRecord = e.target.checked ? true : false
            this.setState({
                checkedList: e.target.checked ? checkedList : [],
                dialAll: e.target.checked
            })
        }
        // his.props.getSpecialState(checkedList)
    }

    _handleCancel = (e) => {
        browserHistory.push('/maintenance/backup')
    }
    _handleSubmit = (e) => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const { form } = this.props
        let me = this
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG904" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG844" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                let action = values
                action['config'] = 'no'
                action['cdr'] = 'no'
                action['voice_record'] = 'no'
                action['vfax'] = 'no'
                action['voicemail_file'] = 'no'
                action['voice_file'] = 'no'
                action['storage'] = 'no'
                this.state.checkedList.map(function(item) {
                    action[item] = "yes"
                })

                action["action"] = "updateBackupSettings"
                action["type"] = "regular"
                if (action["enable_regular"] === true) {
                    action["enable_regular"] = "yes"
                } else {
                    action["enable_regular"] = "no"
                }

                delete action.newbkp_name

                let warnMsg = ''

                if (this.state.checkedList.length === 0) {
                    warnMsg = "LANG852"
                } else {
                    if (action["config"] === 'no' && (action["vfax"] === 'yes' || action["voice_file"] === 'yes' || action["storage"] === 'yes')) {
                        warnMsg = 'LANG5267'
                    }
                }

                if (warnMsg !== "") {
                    Modal.warning({
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: warnMsg})}} ></span>,
                        okText: (formatMessage({id: "LANG727"}))
                    })
                } else {
                    delete action.newbkp_name
                    message.loading(loadingMessage, 0)

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
                                let actionEn = {}
                                actionEn.action = "reloadCrontabs"
                                actionEn.crontabjobs = ""
                                $.ajax({
                                    url: api.apiHost,
                                    method: "get",
                                    data: actionEn,
                                    type: 'json',
                                    async: false,
                                    error: function(e) {
                                        message.error(e.statusText)
                                    },
                                    success: function(data) {
                                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                        if (bool) {
                                            message.destroy()
                                            this._handleCancel()
                                            message.success(successMessage)
                                        }
                                    }.bind(this)
                                })
                            }
                        }.bind(this)
                    })
                }
            }
        })
    }
    _onChangeEnable = (e) => {
        let data = this.state.settings

        data.enable_regular = e.target.checked

        this.setState({
            settings: data
        })
    }

    _testServer = (e) => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        let a = form.getFieldValue('enable_regular') 

        if (a !== true) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG858"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            form.validateFieldsAndScroll({ force: true }, (err, values) => {
                if (!err) {
                    let loadingMessage = ''
                    let successMessage = ''

                    loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG859" })}}></span>
                    successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

                    message.loading(loadingMessage, 0)

                    let test_server = ''
                    test_server = form.getFieldValue('username') + ',' + form.getFieldValue('password') + ',' + form.getFieldValue('server')
                    $.ajax({
                        url: api.apiHost,
                        method: 'post',
                        data: {
                            "action": "reloadTestSftp",
                            "test_server": test_server
                        },
                        type: 'json',
                        async: true,
                        success: function(res) {
                            const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(formatMessage({ id: "LANG3213"}))
                            }
                        }.bind(this),
                        error: function(e) {
                            message.error(e.statusText)
                        }
                    })
                }
            })
        }
    }
    _onLocationChange = (value) => {
        let data = this.state.settings
        data["location"] = value
        this.setState({
            settings: data
        })
    }
    _checkDirectory = (data, value, callback, formatMessage) => {
        if (value && !/^([\w-.]+)(\/[\w-.]+)*$/i.test(value)) {
            callback(formatMessage({id: "LANG2767"}))
        } else {
            callback()
        }
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const checkedList = this.state.checkedList
        const plainOptions = this.state.plainOptions
        const settings = this.state.settings
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const title = formatMessage({id: "LANG4048"})

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemPromptLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 9 }
        }

        const formItemLayoutTime = {
            labelCol: { span: 3 },
            wrapperCol: { span: 1 }
        }

        const formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="content">
                <Title
                    headerTitle={ title }
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit.bind(this) }
                    isDisplay='display-block'
                />
                <Form>
                    <FormItem
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG4049" />}>
                                <span>{formatMessage({id: "LANG4049"})}</span>
                            </Tooltip>
                        }
                    >
                        { getFieldDecorator('enable_regular', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: settings.enable_regular
                        })(
                            <Checkbox onChange={ this._onChangeEnable } />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG4055" />}>
                                <span>{formatMessage({id: "LANG4055"})}</span>
                            </Tooltip>
                        )}>
                        <CheckboxGroup options={ plainOptions } value={ checkedList } onChange={ this._onChangeDial } disabled={ !settings.enable_regular } />
                        <Col span={ 2 }>
                            <Checkbox checked={ this.state.dialAll } onChange={ this._onDialallChange } disabled={ !settings.enable_regular } />
                        </Col>
                        <Col span={ 6 }>{formatMessage({id: "LANG104"})}</Col>
                    </FormItem>
                    <FormItem
                        { ...formItemPromptLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG4073" />}>
                                <span>{formatMessage({id: "LANG4073"})}</span>
                            </Tooltip>
                        )}>
                        <Row>
                            <Col span={16} >
                                { getFieldDecorator('location', {
                                    rules: [],
                                    width: 100,
                                    initialValue: settings.location
                                })(
                                    <Select onChange={this._onLocationChange} disabled={ !settings.enable_regular } >
                                        <Option value="network">{ formatMessage({id: "LANG4074"}) }</Option>  
                                        {
                                            this.state.storageList.map(function(item) {
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
                        </Row>
                    </FormItem>
                    <div className={ this.state.settings.location === "network" ? "display-block" : "hidden" }>
                        <FormItem
                            { ...formItemLayout }
                            label={(                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1423" />}>
                                    <span>{formatMessage({id: "LANG1422"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('username', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: settings.enable_regular && this.state.settings.location === "network",
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        settings.enable_regular && this.state.settings.location === "network" ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        settings.enable_regular && this.state.settings.location === "network" ? Validator.alphanumericUndDotAt(data, value, callback, formatMessage) : callback()
                                    }
                                }],
                                initialValue: settings.username
                            })(
                                <Input maxLength="32" disabled={ !settings.enable_regular } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1425" />}>
                                    <span>{formatMessage({id: "LANG1424"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('password', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        settings.enable_regular && this.state.settings.location === "network" ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        settings.enable_regular && this.state.settings.location === "network" ? Validator.alphanumericUnd(data, value, callback, formatMessage) : callback()
                                    }
                                }],
                                initialValue: settings.password
                            })(
                                <Input maxLength="32" disabled={ !settings.enable_regular } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1427" />}>
                                    <span>{formatMessage({id: "LANG1426"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('server', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: settings.enable_regular && this.state.settings.location === "network",
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        settings.enable_regular && this.state.settings.location === "network" ? Validator.maxlength(data, value, callback, formatMessage, 256) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        settings.enable_regular && this.state.settings.location === "network" ? Validator.host(data, value, callback, formatMessage, 'IP or URL') : callback()
                                    }
                                }],
                                initialValue: settings.server
                            })(
                                <Input maxLength="256" disabled={ !settings.enable_regular } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG4536" />}>
                                    <span>{formatMessage({id: "LANG4535"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('backup_dir', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        settings.enable_regular && this.state.settings.location === "network" ? Validator.maxlength(data, value, callback, formatMessage, 256) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        settings.enable_regular && this.state.settings.location === "network" ? this._checkDirectory(data, value, callback, formatMessage) : callback()
                                    }
                                }],
                                initialValue: settings.backup_dir
                            })(
                                <Input maxLength="256" disabled={ !settings.enable_regular } />
                            ) }
                        </FormItem>
                    </div>
                    <FormItem
                        { ...formItemLayout }
                        label={(                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG1429" />}>
                                <span>{formatMessage({id: "LANG1428"})}</span>
                            </Tooltip>
                        )}
                    >
                        { getFieldDecorator('time', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: settings.enable_regular,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    settings.enable_regular ? Validator.digits(data, value, callback, formatMessage) : callback()
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    settings.enable_regular ? Validator.range(data, value, callback, formatMessage, 0, 23) : callback()
                                }
                            }],
                            initialValue: settings.time
                        })(
                            <Input min={ 0 } max={ 23 } disabled={ !settings.enable_regular } />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG4051" />}>
                                <span>{formatMessage({id: "LANG4050"})}</span>
                            </Tooltip>
                        )}
                    >
                        { getFieldDecorator('interval', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: settings.enable_regular,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    settings.enable_regular ? Validator.digits(data, value, callback, formatMessage) : callback()
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    settings.enable_regular ? Validator.range(data, value, callback, formatMessage, 1, 30) : callback()
                                }
                            }],
                            initialValue: settings.interval
                        })(
                            <Input min={ 1 } max={ 30 } disabled={ !settings.enable_regular } />
                        ) }
                    </FormItem>
                    <div className={ this.state.settings.location === "network" ? "display-block" : "hidden" }>
                        <div className="top-button">
                            <Button
                                icon="plus"
                                type="primary"
                                size='default'
                                onClick={ this._testServer }
                            >
                                { formatMessage({id: "LANG761"}) }
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        )
    }
}

export default Form.create()(injectIntl(BackupRegular))

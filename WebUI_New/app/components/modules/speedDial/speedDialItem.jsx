'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, message, Checkbox, Tooltip, Select, Row, Col } from 'antd'

const Option = Select.Option
const FormItem = Form.Item

class SpeedDialItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            accountList: [],
            speedDialItem: {},
            keypress: 'account',
            keypressevent: '',
            memberselectShow: true,
            account: [],
            voicemail: [],
            conference: [],
            vmgroup: [],
            ivr: [],
            ringgroup: [],
            queue: [],
            paginggroup: [],
            fax: [],
            disa: [],
            directory: [],
            external_number: '',
            external_numberShow: false
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkAccount = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.accountList, parseInt(value) + '') > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _transAccountVoicemailData = (res) => {
        const { formatMessage } = this.props.intl

        var arr = []

        for (var i = 0; i < res.length; i++) {
            var obj = {},
                extension = res[i].extension,
                fullname = res[i].fullname,
                disabled = res[i].out_of_service

            obj["val"] = extension

            if (disabled === 'yes') {
                obj["class"] = 'disabledExtOrTrunk'
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + formatMessage({id: "LANG273"}) + '>'
                obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <'
                obj["disable"] = true
            } else {
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '')
            }

            arr.push(obj)
        }

        return arr
    }
    _transData = (res) => {
        var arr = []

        for (var i = 0; i < res.length; i++) {
            var obj = {}

            obj["val"] = res[i]
            obj["text"] = res[i]

            arr.push(obj)
        }

        return arr
    }
    _transObjData = (res, options) => {
        var val = options.val,
            text = options.text,
            arr = []

        for (var i = 0; i < res.length; i++) {
            var obj = {}

            obj["val"] = res[i][val].toString()
            obj["text"] = res[i][text]

            arr.push(obj)
        }

        return arr
    }
    _getInitData = () => {
        const __this = this
        let accountList = []
        let speedDialItem = {}
        const { formatMessage } = this.props.intl
        const account = this.props.params.id
        let keypress = this.state.keypress || 'account'
        let keypressevent = this.state.keypressevent || ''
        let memberselectShow = this.state.memberselectShow || true
        let external_numberShow = this.state.external_numberShow || false
        let external_number = this.state.external_number || ''
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getNumberList' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    accountList = response.number || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        if (account) {
            accountList = _.without(accountList, account)
        }

        let keyAccountList = this._transAccountVoicemailData(UCMGUI.isExist.getList("getAccountList"))
        keypressevent = keyAccountList[0].val
        let keyVoicemailList = this._transAccountVoicemailData(UCMGUI.isExist.getList("getVoicemailList"))
        let keyConferencelList = this._transData(UCMGUI.isExist.getList("getConferenceList"))
        let keyVMGrouplList = this._transObjData(
            UCMGUI.isExist.getList("getVMgroupList"),
            {
                val: "extension",
                text: "vmgroup_name"
            }
        )
        let keyIVRList = this._transObjData(
            UCMGUI.isExist.getList("getIVRList"),
            {
                val: "ivr_id",
                text: "ivr_name"
            }
        )
        let keyRinggroupList = this._transObjData(
            UCMGUI.isExist.getList("getRinggroupList"),
            {
                val: "extension",
                text: "ringgroup_name"
            }
        )
        let keyQueueList = this._transObjData(
            UCMGUI.isExist.getList("getQueueList"),
            {
                val: "extension",
                text: "queue_name"
            }
        )
        let keyPaginList = this._transObjData(
            UCMGUI.isExist.getList("getPaginggroupList"),
            {
                val: "extension",
                text: "paginggroup_name"
            }
        )
        let keyFaxList = this._transObjData(
            UCMGUI.isExist.getList("getFaxList"),
            {
                val: "extension",
                text: "fax_name"
            }
        )
        let keyDisaList = this._transObjData(
            UCMGUI.isExist.getList("getDISAList"),
            {
                val: "disa_id",
                text: "display_name"
            }
        )
        let keyDirectoryList = this._transObjData(
            UCMGUI.isExist.getList("getDirectoryList"),
            {
                val: "extension",
                text: "name"
            }
        )
        if (account) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getSpeedDial',
                    speed_dial: account
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        speedDialItem = res.response.speed_dial || {}
                        keypress = speedDialItem.destination_type
                        keypressevent = speedDialItem.destination_num

                        if (speedDialItem.destination_type === 'external_number') {
                            memberselectShow = false
                            external_numberShow = true
                            external_number = speedDialItem.destination_num
                        } else {
                            memberselectShow = true
                            external_numberShow = false
                        }
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        this.setState({
            accountList: accountList,
            account: keyAccountList,
            keypress: keypress,
            keypressevent: keypressevent,
            memberselectShow: memberselectShow,
            external_numberShow: external_numberShow,
            voicemail: keyVoicemailList,
            conference: keyConferencelList,
            vmgroup: keyVMGrouplList,
            ivr: keyIVRList,
            ringgroup: keyRinggroupList,
            queue: keyQueueList,
            paginggroup: keyPaginList,
            fax: keyFaxList,
            disa: keyDisaList,
            directory: keyDirectoryList,
            speedDialItem: speedDialItem,
            external_number: external_number
        })
    }
    _handleKeypressChange = (e) => {
        let keypressevent = ''
        let memberselectShow = this.state.memberselectShow || ''
        let external_numberShow = this.state.external_numberShow || false
        if (this.state[e].length > 0) {
            keypressevent = this.state[e][0].val
        }

        if (e === 'external_number') {
            memberselectShow = false
            external_numberShow = true
        } else {
            memberselectShow = true
            external_numberShow = false
        }
        this.setState({
            keypress: e,
            memberselectShow: memberselectShow,
            external_numberShow: external_numberShow
        })

        this.props.form.setFieldsValue({
          keypressevent: keypressevent
        })
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/speedDial')
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

                message.loading(loadingMessage)

                let action = values
                action['account'] = ''
                action['voicemail'] = ''
                action['conference'] = ''
                action['vmgroup'] = ''
                action['ivr'] = ''
                action['ringgroup'] = ''
                action['queue'] = ''
                action['paginggroup'] = ''
                action['fax'] = ''
                action['disa'] = ''
                action['directory'] = ''
                action['external_number'] = ''

                if (values.enable_destination === true) {
                    action.enable_destination = "yes"  
                } else {
                    action.enable_destination = "no" 
                }

                action.destination_type = values.keypress
                delete action.keypress

               if (values.destination_type === 'external_number') {
                    action[action.destination_type] = values.keypress_event_ext
                } else {
                    action[action.destination_type] = values.keypressevent
                }
                
                delete action.keypressevent
                delete action.keypress_event_ext

               if (account) {
                    action.action = 'updateSpeedDial'
                    action.extension = Number(action.speed_dial)
                    action.speed_dial = account
                } else {
                    action.speed_dial = Number(action.speed_dial)
                    action.action = 'addSpeedDial'
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
    _createDial = () => {
        let accountList = this.state.accountList

        for (let i = 0; i < 100; i++) {
            if (_.indexOf(accountList, i.toString()) === -1) {
                return i
            }
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const speedDialItem = this.state.speedDialItem || {}
        let account = speedDialItem.extension
        let keypress = this.state.keypress
        let keypressevent = this.state.keypressevent

        if (!account) {
            account = this._createDial()
        }

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 12 },
            wrapperCol: { span: 12 }
        }

        let keyList = this.state[this.state.keypress],
            keyOption
        if (keyList.length !== 0 && this.state.keypress !== "external_number") {
            keyOption = keyList.map(function(value, index) {
                            return <Option value={ value.val } key={ value.val }>{ value.text }</Option>
                        })
        } else {
            keyOption = <Option value=''>{ formatMessage({id: "LANG133"}) }</Option>
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG3501"}),
                    1: this.props.params.id
                })
                : formatMessage({id: "LANG5087"}))

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
                    isDisplay='display-block'/>
                <div className="content">
                    <Form>
                        <Row>
                            <Col span={ 24 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG2990" />}>
                                            <span>{formatMessage({id: "LANG2990"})}</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('enable_destination', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: speedDialItem.enable_destination === "yes" ? true : false
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={ 24 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG5108" />}>
                                            <span>{formatMessage({id: "LANG5108"})}</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('speed_dial', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.maxlength(data, value, callback, formatMessage, 2)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.digits(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: this._checkAccount
                                        }],
                                        initialValue: account
                                    })(
                                        <Input maxLength="2" />
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={ 6 } style={{ marginRight: 20 }}>
                                <FormItem
                                    { ...formItemTransferLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG1558" />}>
                                            <span>{formatMessage({id: "LANG1558"})}</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('keypress', {
                                        initialValue: keypress
                                    })(
                                        <Select onChange={ this._handleKeypressChange }>
                                            <Option value="account">{ formatMessage({id: "LANG85"}) }</Option>
                                            <Option value="voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                            <Option value="conference">{ formatMessage({id: "LANG98"}) }</Option>
                                            <Option value="vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                            <Option value="ivr">{ formatMessage({id: "LANG19"}) }</Option>
                                            <Option value="ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                            <Option value="queue">{ formatMessage({id: "LANG91"}) }</Option>
                                            <Option value="paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                            <Option value="fax">{ formatMessage({id: "LANG95"}) }</Option>
                                            <Option value="disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                            <Option value="directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                            <Option value="external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 3 } className={ this.state.memberselectShow ? "display-block" : "hidden" } >
                                <FormItem>
                                    { getFieldDecorator('keypressevent', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.memberselectShow,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: keypressevent
                                    })(
                                        <Select>
                                            { keyOption }
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 3 } className={ this.state.external_numberShow ? "display-block" : "hidden" } >
                                <FormItem
                                    ref="div_keypress_event_ext_0">
                                    { getFieldDecorator('keypress_event_ext', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.external_numberShow,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.external_numberShow ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                            }
                                        }],
                                        width: 100,
                                        initialValue: this.state.external_number
                                    })(
                                        <Input maxLength='32' />
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(SpeedDialItem))

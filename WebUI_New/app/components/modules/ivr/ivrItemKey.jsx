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
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class KeySettings extends Component {
    constructor(props) {
        super(props)

        this.state = {
            keypressKey: {
                "0": "",
                "1": "",
                "2": "",
                "3": "",
                "4": "",
                "5": "",
                "6": "",
                "7": "",
                "8": "",
                "9": "",
                "*": "",
                "i": "",
                "t": ""
            },
            keypressEvent: {
                "0": "",
                "1": "",
                "2": "",
                "3": "",
                "4": "",
                "5": "",
                "6": "",
                "7": "",
                "8": "",
                "9": "",
                "*": "",
                "i": "",
                "t": ""
            },
            external_numberShow: {
                "0": false,
                "1": false,
                "2": false,
                "3": false,
                "4": false,
                "5": false,
                "6": false,
                "7": false,
                "8": false,
                "9": false,
                "*": false,
                "i": false,
                "t": false
            },
            memberselectShow: {
                "0": false,
                "1": false,
                "2": false,
                "3": false,
                "4": false,
                "5": false,
                "6": false,
                "7": false,
                "8": false,
                "9": false,
                "*": false,
                "i": false,
                "t": false
            },
            pressEventList_0: [],
            pressEventList_1: [],
            pressEventList_2: [],
            pressEventList_3: [],
            pressEventList_4: [],
            pressEventList_5: [],
            pressEventList_6: [],
            pressEventList_7: [],
            pressEventList_8: [],
            pressEventList_9: [],
            pressEventList_10: [],
            pressEventList_t: [],
            pressEventList_i: [],
            pressEventList: {
                "0": [],
                "1": [],
                "2": [],
                "3": [],
                "4": [],
                "5": [],
                "6": [],
                "7": [],
                "8": [],
                "9": [],
                "*": [],
                "i": [],
                "t": []
            },
            external_number: {
                "0": "",
                "1": "",
                "2": "",
                "3": "",
                "4": "",
                "5": "",
                "6": "",
                "7": "",
                "8": "",
                "9": "",
                "*": "",
                "i": "",
                "t": ""
            }
        }
    }
    componentWillMount() {
        this._getInitData()
    }
    componentDidMount() {
    }
    _getValueName = (e, value) => {
        const accountList = this.props.accountList
        const voicemailList = this.props.voicemailList
        const conferenceList = this.props.conferenceList
        const vmgruopList = this.props.vmgruopList
        const ivrList = this.props.ivrList
        const queueList = this.props.queueList
        const ringgroupList = this.props.ringgroupList
        const paginggroupList = this.props.paginggroupList
        const faxList = this.props.faxList
        const disaList = this.props.disaList
        const directoryList = this.props.directoryList
        const callbackList = this.props.callbackList
        const fileList = this.props.fileList
        let name = value
        if (e === "member_account") {
            accountList.map(function(item) {
                if (item.key === value) {
                    name = item.title
                    return name
                }
            })
        } else if (e === "member_voicemail") {
            voicemailList.map(function(item) {
                if (item.key === value) {
                    name = item.title
                    return name
                }
            })
        } else if (e === "member_conference") {
            conferenceList.map(function(item) {
                if (item.value === value) {
                    name = item.key
                    return name
                }
            })
        } else if (e === "member_vmgroup") {
            vmgruopList.map(function(item) {
                if (item.value === value) {
                    name = item.key
                    return name
                }
            })
        } else if (e === "member_ivr") {
            ivrList.map(function(item) {
                if (item.value === value) {
                    name = item.key
                    return name
                }
            })
        } else if (e === "member_ringgroup") {
            ringgroupList.map(function(item) {
                if (item.value === value) {
                    name = item.key
                    return name
                }
            })
        } else if (e === "member_queue") {
            queueList.map(function(item) {
                if (item.value === value) {
                    name = item.key
                    return name
                }
            })
        } else if (e === "member_paginggroup") {
            paginggroupList.map(function(item) {
                if (item.value === value) {
                    name = item.key
                    return name
                }
            })
        } else if (e === "member_fax") {
            faxList.map(function(item) {
                if (item.value === value) {
                    name = item.key
                    return name
                }
            })
        } else if (e === "member_prompt") {
            fileList.map(function(item) {
                if (item.val === value) {
                    name = item.text
                    return name
                }
            })
        } else if (e === "member_disa") {
            disaList.map(function(item) {
                if (item.value === parseInt(value)) {
                    name = item.key
                    return name
                }
            })
        } else if (e === "member_directory") {
            directoryList.map(function(item) {
                if (item.value === value) {
                    name = item.key
                    return name
                }
            })
        } else if (e === "member_callback") {
            callbackList.map(function(item) {
                if (item.value === value) {
                    name = item.key
                    return name
                }
            })
        } else {
            name = value
        }
        return name
    }
    _getInitData = () => {
        const ivrItemMembers = this.props.ivrItemMembers || {}
        const fileList = this.props.fileList || {}
        let keypressKey = this.state.keypressKey || {}
        let keypressEvent = this.state.keypressEvent || {}
        let memberselectShow = this.state.memberselectShow || {}
        let external_numberShow = this.state.external_numberShow || {}
        let external_number = this.state.external_number || {}
        let pressEventList = this.state.pressEventList || {}
        const __this = this

        if (ivrItemMembers.length > 0) {
            ivrItemMembers.map(function(item) {
                keypressKey[item.keypress] = item.keypress_event
                if (item.keypress_event === 'member_external_number') {
                    memberselectShow[item.keypress] = false
                    external_numberShow[item.keypress] = true
                    external_number[item.keypress] = item[item.keypress_event]
                } else if (item.keypress_event === "member_hangup") {
                    memberselectShow[item.keypress] = false
                    external_numberShow[item.keypress] = false
                } else {
                    memberselectShow[item.keypress] = true
                    external_numberShow[item.keypress] = false
                    keypressEvent[item.keypress] = __this._getValueName(item.keypress_event, item[item.keypress_event]) 
                }
                __this._onChangeKeypress(item.keypress_event, item.keypress, 0)
            })
            if (keypressKey['t'] === 'member_prompt') {
                pressEventList['t'].push({"key": "goodbye", "value": "goodbye", "disabled": false})
            }
            if (keypressKey['i'] === 'member_prompt') {
                pressEventList['i'].push({"key": "goodbye", "value": "goodbye", "disabled": false})
            }
        } else {
            memberselectShow['t'] = true
            memberselectShow['i'] = true
            keypressEvent['t'] = "goodbye"
            keypressEvent['i'] = "goodbye"
            pressEventList['t'].push({"key": "goodbye", "value": "goodbye", "disabled": false})
            pressEventList['i'].push({"key": "goodbye", "value": "goodbye", "disabled": false})
            fileList.map(function(item) {
                let tmp = {}
                tmp.key = item.text
                tmp.value = item.val
                tmp.disabled = false
                pressEventList['t'].push(tmp)
                pressEventList['i'].push(tmp)
            })
        }

        this._getOptionValue = () => {

        }

        this.setState({
            keypressKey: keypressKey,
            keypressEvent: keypressEvent,
            external_number: external_number,
            pressEventList: pressEventList
        })
    }
    _onFocus = (e) => {
        e.preventDefault()

        const form = this.props.form

        form.validateFields([e.target.id], { force: true })
    }
    _onChangeKeypress = (e, key, press) => {
        const accountList = this.props.accountList
        const voicemailList = this.props.voicemailList
        const conferenceList = this.props.conferenceList
        const vmgruopList = this.props.vmgruopList
        const ivrList = this.props.ivrList
        const queueList = this.props.queueList
        const ringgroupList = this.props.ringgroupList
        const paginggroupList = this.props.paginggroupList
        const faxList = this.props.faxList
        const disaList = this.props.disaList
        const directoryList = this.props.directoryList
        const callbackList = this.props.callbackList
        const fileList = this.props.fileList
        let memberselectShow = this.state.memberselectShow || {}
        let external_numberShow = this.state.external_numberShow || {}
        let pressEventList_0 = this.state.pressEventList_0 || {}
        let keypressEvent = this.state.keypressEvent
        let pressEventList = this.state.pressEventList || {}

        memberselectShow[key] = true
        external_numberShow[key] = false

        if (e === "member_account") {
            pressEventList[key] = []
            accountList.map(function(item) {
                let tmp = {}
                tmp.key = item.title
                tmp.value = item.key
                tmp.disabled = item.out_of_service === "yes"
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_voicemail") {
            pressEventList[key] = []
            voicemailList.map(function(item) {
                let tmp = {}
                tmp.key = item.title
                tmp.value = item.key
                tmp.disabled = item.out_of_service === "yes"
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_conference") {
            pressEventList[key] = []
            conferenceList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_vmgroup") {
            pressEventList[key] = []
            vmgruopList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_ivr") {
            pressEventList[key] = []
            ivrList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_ringgroup") {
            pressEventList[key] = []
            ringgroupList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_queue") {
            pressEventList[key] = []
            queueList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_paginggroup") {
            pressEventList[key] = []
            paginggroupList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_fax") {
            pressEventList[key] = []
            faxList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_prompt") {
            pressEventList[key] = []
            fileList.map(function(item) {
                let tmp = {}
                tmp.key = item.text
                tmp.value = item.val
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
            if (key === 't') {
                pressEventList['t'].push({"key": "goodbye", "value": "goodbye", "disabled": false})
            }
            if (key === 'i') {
                pressEventList['i'].push({"key": "goodbye", "value": "goodbye", "disabled": false})
            }
        } else if (e === "member_hangup") {
            memberselectShow[key] = false
            external_numberShow[key] = false
        } else if (e === "member_disa") {
            pressEventList[key] = []
            disaList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_directory") {
            pressEventList[key] = []
            directoryList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
        } else if (e === "member_external_number") {
            external_numberShow[key] = true
            memberselectShow[key] = false
        } else if (e === "member_callback") {
            pressEventList[key] = []
            callbackList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList[key].push(tmp)
            })
        } else {
            memberselectShow[key] = false
            external_numberShow[key] = false
        }
        this.setState({
            external_numberShow: external_numberShow,
            memberselectShow: memberselectShow,
            pressEventList: pressEventList
        })

        if (press === 1) {
            keypressEvent[key] = null
            this.setState({
                keypressEvent: keypressEvent
            })
            let keypress_event = pressEventList[key].length > 0 ? pressEventList[key][0].key : ""
            if (key === "0") {
                this.props.form.setFieldsValue({
                    keypress_event_0: keypress_event
                })
            } else if (key === "1") {
                this.props.form.setFieldsValue({
                    keypress_event_1: keypress_event
                })
            } else if (key === "2") {
                this.props.form.setFieldsValue({
                    keypress_event_2: keypress_event
                })
            } else if (key === "3") {
                this.props.form.setFieldsValue({
                    keypress_event_3: keypress_event
                })
            } else if (key === "4") {
                this.props.form.setFieldsValue({
                    keypress_event_4: keypress_event
                })
            } else if (key === "5") {
                this.props.form.setFieldsValue({
                    keypress_event_5: keypress_event
                })
            } else if (key === "6") {
                this.props.form.setFieldsValue({
                    keypress_event_6: keypress_event
                })
            } else if (key === "7") {
                this.props.form.setFieldsValue({
                    keypress_event_7: keypress_event
                })
            } else if (key === "8") {
                this.props.form.setFieldsValue({
                    keypress_event_8: keypress_event
                })
            } else if (key === "9") {
                this.props.form.setFieldsValue({
                    keypress_event_9: keypress_event
                })
            } else if (key === "*") {
                this.props.form.setFieldsValue({
                    keypress_event_10: keypress_event
                })
            } else if (key === "t") {
                this.props.form.setFieldsValue({
                    keypress_event_t: keypress_event
                })
            } else if (key === "i") {
                this.props.form.setFieldsValue({
                    keypress_event_i: keypress_event
                })
            } 
        }
    }
    _onChangeKeypress_0 = (e) => {
        this._onChangeKeypress(e, "0", 1)
    }
    _onChangeKeypress_1 = (e) => {
        this._onChangeKeypress(e, "1", 1)
    }
    _onChangeKeypress_2 = (e) => {
        this._onChangeKeypress(e, "2", 1)
    }
    _onChangeKeypress_3 = (e) => {
        this._onChangeKeypress(e, "3", 1)
    }
    _onChangeKeypress_4 = (e) => {
        this._onChangeKeypress(e, "4", 1)
    }
    _onChangeKeypress_5 = (e) => {
        this._onChangeKeypress(e, "5", 1)
    }
    _onChangeKeypress_6 = (e) => {
        this._onChangeKeypress(e, "6", 1)
    }
    _onChangeKeypress_7 = (e) => {
        this._onChangeKeypress(e, "7", 1)
    }
    _onChangeKeypress_8 = (e) => {
        this._onChangeKeypress(e, "8", 1)
    }
    _onChangeKeypress_9 = (e) => {
        this._onChangeKeypress(e, "9", 1)
    }
    _onChangeKeypress_10 = (e) => {
        this._onChangeKeypress(e, "*", 1)
    }
    _onChangeKeypress_i = (e) => {
        this._onChangeKeypress(e, "i", 1)
    }
    _onChangeKeypress_t = (e) => {
        this._onChangeKeypress(e, "t", 1)
    }
    _onChangeKeypress_11111 = (e) => {
        const accountList = this.props.accountList
        const voicemailList = this.props.voicemailList
        const conferenceList = this.props.conferenceList
        const vmgruopList = this.props.vmgruopList
        const ivrList = this.props.ivrList
        const queueList = this.props.queueList
        const ringgroupList = this.props.ringgroupList
        const paginggroupList = this.props.paginggroupList
        const faxList = this.props.faxList
        const disaList = this.props.disaList
        const directoryList = this.props.directoryList
        const callbackList = this.props.callbackList
        const fileList = this.props.fileList
        let memberselectShow = this.state.memberselectShow || {}
        let external_numberShow = this.state.external_numberShow || {}
        let pressEventList_1 = this.state.pressEventList_1 || {}
        let keypressEvent = this.state.keypressEvent

        memberselectShow['1'] = true
        external_numberShow['1'] = false
        keypressEvent['1'] = null
        if (e === "member_account") {
            pressEventList_1 = []
            accountList.map(function(item) {
                let tmp = {}
                tmp.key = item.title
                tmp.value = item.key
                tmp.disabled = item.out_of_service === "yes"
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_voicemail") {
            pressEventList_1 = []
            voicemailList.map(function(item) {
                let tmp = {}
                tmp.key = item.title
                tmp.value = item.key
                tmp.disabled = item.out_of_service === "yes"
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_conference") {
            pressEventList_1 = []
            conferenceList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_vmgroup") {
            pressEventList_1 = []
            vmgruopList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_ivr") {
            pressEventList_1 = []
            ivrList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_ringgroup") {
            pressEventList_1 = []
            ringgroupList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_queue") {
            pressEventList_1 = []
            queueList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_paginggroup") {
            pressEventList_1 = []
            paginggroupList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_fax") {
            pressEventList_1 = []
            faxList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_prompt") {
            pressEventList_1 = []
            fileList.map(function(item) {
                let tmp = {}
                tmp.key = item.text
                tmp.value = item.val
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_hangup") {
            memberselectShow['1'] = false
            external_numberShow['1'] = false
        } else if (e === "member_disa") {
            pressEventList_1 = []
            disaList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_directory") {
            pressEventList_1 = []
            directoryList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else if (e === "member_external_number") {
            external_numberShow['1'] = true
            memberselectShow['1'] = false
        } else if (e === "member_callback") {
            pressEventList_1 = []
            callbackList.map(function(item) {
                let tmp = {}
                tmp.key = item.key
                tmp.value = item.value
                tmp.disabled = false
                pressEventList_1.push(tmp)
            })
        } else {
            memberselectShow['1'] = false
            external_numberShow['1'] = false
        }
        this.setState({
            external_numberShow: external_numberShow,
            memberselectShow: memberselectShow,
            pressEventList_1: pressEventList_1,
            keypressEvent: keypressEvent
        })
        this.props.form.setFieldsValue({
            keypress_event_1: pressEventList_1.length > 0 ? pressEventList_1[0].key : ""
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const settings = this.props.settings || {}
        const { getFieldDecorator } = this.props.form
        const currentEditId = this.props.currentEditId
        const ivrItemMembers = this.props.ivrItemMembers || {}
        const keypressKey = this.state.keypressKey || {}
        const keypressEvent = this.state.keypressEvent || {}
        const me = this

        const formItemLayout = {
            labelCol: { span: 12 },
            wrapperCol: { span: 12 }
        }

        return (
            <div className="content">
                <Form>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_0"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1460" />}>
                                        <span>{formatMessage({id: "LANG1460"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_0', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['0'] ? keypressKey['0'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_0 } >
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['0'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_0">
                                { getFieldDecorator('keypress_event_0', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['0'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['0'] ? keypressEvent['0'] : (this.state.pressEventList['0'].length > 0 ? this.state.pressEventList['0'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['0'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['0'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_0">
                                { getFieldDecorator('keypress_event_ext_0', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['0'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['0'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['0']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_1"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1461" />}>
                                        <span>{formatMessage({id: "LANG1461"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_1', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['1'] ? keypressKey['1'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_1 }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['1'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_1">
                                { getFieldDecorator('keypress_event_1', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['1'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['1'] ? keypressEvent['1'] : (this.state.pressEventList['1'].length > 0 ? this.state.pressEventList['1'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['1'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['1'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_1">
                                { getFieldDecorator('keypress_event_ext_1', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['1'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['1'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['1']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_2"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1462" />}>
                                        <span>{formatMessage({id: "LANG1462"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_2', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['2'] ? keypressKey['2'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_2 }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['2'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_2">
                                { getFieldDecorator('keypress_event_2', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['2'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['2'] ? keypressEvent['2'] : (this.state.pressEventList['2'].length > 0 ? this.state.pressEventList['2'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['2'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['2'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_2">
                                { getFieldDecorator('keypress_event_ext_2', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['2'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['2'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['2']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_3"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1463" />}>
                                        <span>{formatMessage({id: "LANG1463"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_3', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['3'] ? keypressKey['3'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_3 }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['3'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_3">
                                { getFieldDecorator('keypress_event_3', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['3'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['3'] ? keypressEvent['3'] : (this.state.pressEventList['3'].length > 0 ? this.state.pressEventList['3'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['3'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['3'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_3">
                                { getFieldDecorator('keypress_event_ext_3', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['3'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['3'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['3']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_4"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1464" />}>
                                        <span>{formatMessage({id: "LANG1464"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_4', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['4'] ? keypressKey['4'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_4 }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['4'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_4">
                                { getFieldDecorator('keypress_event_4', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['4'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['4'] ? keypressEvent['4'] : (this.state.pressEventList['4'].length > 0 ? this.state.pressEventList['4'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['4'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['4'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_4">
                                { getFieldDecorator('keypress_event_ext_4', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['4'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['4'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['4']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_5"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1465" />}>
                                        <span>{formatMessage({id: "LANG1465"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_5', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['5'] ? keypressKey['5'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_5 }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['5'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_5">
                                { getFieldDecorator('keypress_event_5', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['5'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['5'] ? keypressEvent['5'] : (this.state.pressEventList['5'].length > 0 ? this.state.pressEventList['5'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['5'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['5'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_5">
                                { getFieldDecorator('keypress_event_ext_5', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['5'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['5'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['5']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_6"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1466" />}>
                                        <span>{formatMessage({id: "LANG1466"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_6', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['6'] ? keypressKey['6'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_6 }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['6'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_6">
                                { getFieldDecorator('keypress_event_6', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['6'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['6'] ? keypressEvent['6'] : (this.state.pressEventList['6'].length > 0 ? this.state.pressEventList['6'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['6'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['6'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_6">
                                { getFieldDecorator('keypress_event_ext_6', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['6'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['6'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['6']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_7"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1467" />}>
                                        <span>{formatMessage({id: "LANG1467"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_7', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['7'] ? keypressKey['7'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_7 }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['7'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_7">
                                { getFieldDecorator('keypress_event_7', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['7'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['7'] ? keypressEvent['7'] : (this.state.pressEventList['7'].length > 0 ? this.state.pressEventList['7'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['7'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['7'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_7">
                                { getFieldDecorator('keypress_event_ext_7', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['7'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['7'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['7']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_8"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1468" />}>
                                        <span>{formatMessage({id: "LANG1468"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_8', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['8'] ? keypressKey['8'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_8 }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['8'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_8">
                                { getFieldDecorator('keypress_event_8', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['8'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['8'] ? keypressEvent['8'] : (this.state.pressEventList['8'].length > 0 ? this.state.pressEventList['8'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['8'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['8'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_8">
                                { getFieldDecorator('keypress_event_ext_8', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['8'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['8'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['8']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_9"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1469" />}>
                                        <span>{formatMessage({id: "LANG1469"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_9', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['9'] ? keypressKey['9'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_9 }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['9'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_9">
                                { getFieldDecorator('keypress_event_9', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['9'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['9'] ? keypressEvent['9'] : (this.state.pressEventList['9'].length > 0 ? this.state.pressEventList['9'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['9'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['9'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_9">
                                { getFieldDecorator('keypress_event_ext_9', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['9'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['9'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['9']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_10"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1470" />}>
                                        <span>{formatMessage({id: "LANG1470"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_10', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['*'] ? keypressKey['*'] : ""
                                })(
                                    <Select onChange={ this._onChangeKeypress_10 }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['*'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_10">
                                { getFieldDecorator('keypress_event_10', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['*'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['*'] ? keypressEvent['*'] : (this.state.pressEventList['*'].length > 0 ? this.state.pressEventList['*'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['*'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['*'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_10">
                                { getFieldDecorator('keypress_event_ext_10', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['*'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['*'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['*']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_t"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1481" />}>
                                        <span>{formatMessage({id: "LANG102"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_t', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['t'] ? keypressKey['t'] : "member_prompt"
                                })(
                                    <Select onChange={ this._onChangeKeypress_t }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['t'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_t">
                                { getFieldDecorator('keypress_event_t', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['t'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['t'] ? keypressEvent['t'] : (this.state.pressEventList['t'].length > 0 ? this.state.pressEventList['t'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['t'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['t'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_t">
                                { getFieldDecorator('keypress_event_ext_t', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['t'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['t'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['t']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 } style={{ marginRight: 20 }}>
                            <FormItem
                                ref="div_keypress_i"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1457" />}>
                                        <span>{formatMessage({id: "LANG1452"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('keypress_i', {
                                    rules: [],
                                    width: 100,
                                    initialValue: keypressKey['i'] ? keypressKey['i'] : "member_prompt"
                                })(
                                    <Select onChange={ this._onChangeKeypress_i }>
                                        <Option value="">{ formatMessage({id: "LANG1485"}) }</Option>
                                        <Option value="member_account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="member_voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="member_conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="member_vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="member_ivr">IVR</Option>
                                        <Option value="member_ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="member_queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="member_paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="member_fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="member_prompt">{ formatMessage({id: "LANG238"}) }</Option>
                                        <Option value="member_hangup">{ formatMessage({id: "LANG97"}) }</Option>
                                        <Option value="member_disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="member_directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="member_external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="member_callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.memberselectShow['i'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_i">
                                { getFieldDecorator('keypress_event_i', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.memberselectShow['i'],
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: keypressEvent['i'] ? keypressEvent['i'] : (this.state.pressEventList['i'].length > 0 ? this.state.pressEventList['i'][0].key : "")
                                })(
                                    <Select>
                                    {
                                        this.state.pressEventList['i'].map(function(item) {
                                            return <Option
                                                    key={ item.key }
                                                    value={ item.value }
                                                    disabled={ item.disabled }>
                                                    { item.key }
                                                </Option>
                                        })
                                    }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 3 } className={ this.state.external_numberShow['i'] ? "display-block" : "hidden" } >
                            <FormItem
                                ref="div_keypress_event_ext_i">
                                { getFieldDecorator('keypress_event_ext_i', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.external_numberShow['i'],
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            me.state.external_numberShow['i'] ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage, 0) : callback()
                                        }
                                    }],
                                    width: 100,
                                    initialValue: this.state.external_number['i']
                                })(
                                    <Input maxLength='32' />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}

export default injectIntl(KeySettings)
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
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class RoomAdd extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roomList: [],
            availableAccountList: [],
            roomItem: {},
            addressList: [],
            roomNumberList: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.groupNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkFormat = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        if (value.match(/['"`]/)) {
            callback(formatMessage({id: "LANG4465"}))
        } else {
            callback()
        }
    }
    _addressIsExist = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.addressList, value) > -1) {
            callback(formatMessage({id: "LANG270"}, {0: formatMessage({id: "LANG4893"})}))
        } else {
            callback()
        }
    }
    _roomNumberIsExist = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.roomNumberList, value) > -1) {
            callback(formatMessage({id: "LANG270"}, {0: formatMessage({id: "LANG4854"})}))
        } else {
            callback()
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getInitData = () => {
        const roomId = this.props.params.id
        const roomName = this.props.params.name
        let accountList = []
        let roomList = []
        let usedList = []
        let availableAccountList = []
        let roomItem = {}
        let roomNumberList = []
        let addressList = []

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listPMSRoom',
                options: 'room,status,extension,address',
                sidx: 'room',
                sord: 'asc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    roomList = response.pms_room
                    roomList.map(function(item) {
                        roomNumberList.push(item.room)
                        addressList.push(item.address)
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
                action: 'getAccountList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const extension = response.extension || []

                    accountList = extension
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        accountList.map(function(item) {
            let found = 0
            roomList.map(function(item2) {
                if (item.extension === item2.extension && found === 0) {
                    if (roomId && item2.address === roomId) {
                        found = 0
                    } else {
                        found = 1
                    }
                }
            })
            if (found === 0 && item.account_type === "SIP") {
                availableAccountList.push(item)
            }
        })

        if (roomId) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getPMSRoom',
                    address: roomId
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        roomItem = res.response.address || {}
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
            roomNumberList = _.without(roomNumberList, roomItem.room)
            addressList = _.without(addressList, roomItem.address)
        }

        this.setState({
            accountList: accountList,
            roomItem: roomItem,
            availableAccountList: availableAccountList,
            roomNumberList: roomNumberList,
            addressList: addressList
        })
    }
    _handleCancel = () => {
        browserHistory.push('/value-added-features/pms/2')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const roomId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = {}
                action["pms_room"] = values.pms_room
                action["extension"] = values.extension
                action["address"] = values.address

                if (roomId) {
                    action.action = 'updatePMSRoom'
                    action.address = roomId
                } else {
                    action.action = 'addPMSRoom'
                    action.address = values.address
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

        const disabled = formatMessage({id: "LANG273"})
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
                    0: formatMessage({id: "LANG4856"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG4856"}) }))

        const roomItem = this.state.roomItem || {}

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
                            ref="div_address"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4893" />}>
                                    <span>{formatMessage({id: "LANG4893"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('address', {
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
                                    validator: this._addressIsExist
                                }],
                                width: 100,
                                initialValue: roomItem.address ? roomItem.address : (this.state.availableAccountList.length > 0 ? this.state.availableAccountList[0].extension : "")
                            })(
                                <Input maxLength="128" disabled={ this.props.params.id ? true : false } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_pms_room"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4854" />}>
                                    <span>{formatMessage({id: "LANG4854"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('pms_room', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkFormat
                                }, {
                                    validator: this._roomNumberIsExist
                                }],
                                width: 100,
                                initialValue: roomItem.room ? roomItem.room : (this.state.availableAccountList.length > 0 ? this.state.availableAccountList[0].extension : "")
                            })(
                                <Input maxLength="128" />
                            ) }
                        </FormItem>
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
                                }],
                                width: 100,
                                initialValue: roomItem.extension ? roomItem.extension : (this.state.availableAccountList.length > 0 ? this.state.availableAccountList[0].extension : "")
                            })(
                                <Select >
                                    {
                                        this.state.availableAccountList.map(function(item) {
                                            return <Option
                                                        key={ item.extension }
                                                        value={ item.extension }
                                                        className={ item.out_of_service === 'yes' ? 'out-of-service' : '' }
                                                    >
                                                        {
                                                            (item.extension +
                                                            (item.fullname ? ' "' + item.fullname + '"' : '') +
                                                            (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                                                        }
                                                    </Option>
                                            }
                                        ) 
                                    }
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_account"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4872" />}>
                                    <span>{formatMessage({id: "LANG4872"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('account', {
                                rules: [],
                                required: true,
                                width: 100,
                                initialValue: roomItem.account
                            })(
                                <Input maxLength="128" disabled />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_vipcode"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4873" />}>
                                    <span>{formatMessage({id: "LANG4873"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('vipcode', {
                                rules: [],
                                required: true,
                                width: 100,
                                initialValue: roomItem.vipcode
                            })(
                                <Input maxLength="128" disabled/>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_credit"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4876" />}>
                                    <span>{formatMessage({id: "LANG4876"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('credit', {
                                rules: [],
                                required: true,
                                width: 100,
                                initialValue: roomItem.credit
                            })(
                                <Input maxLength="128" disabled/>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_maid"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4963" />}>
                                    <span>{formatMessage({id: "LANG4963"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('maid', {
                                rules: [],
                                required: true,
                                width: 100,
                                initialValue: roomItem.maid
                            })(
                                <Input maxLength="128" disabled/>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_datein"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4874" />}>
                                    <span>{formatMessage({id: "LANG4874"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('datein', {
                                rules: [],
                                required: true,
                                width: 100,
                                initialValue: roomItem.datein
                            })(
                                <Input maxLength="128" disabled/>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_dateout"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4875" />}>
                                    <span>{formatMessage({id: "LANG4875"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('dateout', {
                                rules: [],
                                required: true,
                                width: 100,
                                initialValue: roomItem.dateout
                            })(
                                <Input maxLength="128" disabled/>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(RoomAdd))
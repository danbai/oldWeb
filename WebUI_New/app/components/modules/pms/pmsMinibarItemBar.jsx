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
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, Row, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class BarItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            roomList: [],
            fileList: [],
            minibarItem: {},
            numberList: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
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
    _checkExtension = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.numberList, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _getInitData = () => {
        const __this = this
        const minibarId = this.props.params.id
        const minibarName = this.props.params.name

        let fileList = []
        let minibarItem = {}
        let numberList = []

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listFile',
                type: 'ivr',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["mp3","wav","gsm","ulaw","alaw"]}',
                sidx: 'n',
                sord: 'desc'
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
                action: 'getNumberList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    numberList = res.response.number || {}
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (minibarId) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    action: 'getMiniBar',
                    extension: minibarId
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        minibarItem = res.response.extension || {}
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        if (minibarId) {
            numberList = _.without(numberList, minibarId)
        }

        this.setState({
            fileList: fileList,
            numberList: numberList,
            minibarItem: minibarItem
        })
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
    _handleCancel = () => {
        browserHistory.push('/value-added-features/pms/4')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const minibarId = this.props.params.id

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        let errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = {}

                action.enable_list_goods = (values.enable_list_goods === true ? "yes" : "no")
                action.prompt = values.prompt
                action.minibar_name = values.minibar_name
                action.verify_skip = (values.verify_skip === true ? "yes" : "no")

                if (minibarId) {
                    action.action = 'updateMiniBar'
                    action.extension = minibarId
                } else {
                    action.action = 'addMiniBar'
                    action.extension = values.extension
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
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        }

        const formItemPromptLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 9 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG5056"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG5056"}) }))

        const wakeupItem = this.state.wakeupItem || {}

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
                            ref="div_extension"
                            className={ this.state.dateShow }
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5055" /> }>
                                    <span>{ formatMessage({id: "LANG4341"}) }</span>
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
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 2)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 18)
                                    }
                                }, {
                                    validator: this._checkExtension
                                }],
                                width: 100,
                                initialValue: this.state.minibarItem.extension
                            })(
                                <Input maxLength="18" disabled={ this.props.params.id ? true : false } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_minibar_name"
                            className={ this.state.dateShow }
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG135" /> }>
                                    <span>{ formatMessage({id: "LANG135"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('minibar_name', {
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
                                }],
                                width: 100,
                                initialValue: this.state.minibarItem.minibar_name
                            })(
                                <Input maxLength="64" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_prompt"
                            { ...formItemPromptLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1484" /> }>
                                    <span>{ formatMessage({id: "LANG1484"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Row>
                                <Col span={ 16 }>
                                    { getFieldDecorator('prompt', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        width: 100,
                                        initialValue: this.state.minibarItem.prompt
                                    })(
                                        <Select>
                                            {
                                                this.state.fileList.map(function(item) {
                                                    return <Option
                                                                key={ item.text }
                                                                value={ item.val }
                                                            >
                                                                { item.text }
                                                            </Option>
                                                    }
                                                ) 
                                            }
                                        </Select>
                                    ) }
                                </Col>
                                <Col span={ 6 } offset={ 1 }>
                                    <a className="prompt_setting" onClick={ this._gotoPrompt }>
                                        { formatMessage({id: "LANG1484"}) }
                                    </a>
                                </Col>
                            </Row>
                        </FormItem>
                        <FormItem
                            ref="div_verify_skip"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5221" /> }>
                                    <span>{ formatMessage({id: "LANG5052"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('verify_skip', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: this.state.minibarItem.verify_skip === "yes" ? true : false
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_enable_list_goods"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5222" /> }>
                                    <span>{ formatMessage({id: "LANG5051"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('enable_list_goods', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: this.state.minibarItem.enable_list_goods === "yes" ? true : false
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(BarItem))
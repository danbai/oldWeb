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
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class GoodsItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            goodsItem: {},
            fileList: [],
            minibarGoodsNameList: [],
            minibarGoodsExtensionList: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._listMinibarGoods()
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
    _checkGoodsExtension = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && !this.props.params.id && _.indexOf(this.state.minibarGoodsExtensionList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkGoodsName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.minibarGoodsNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _getInitData = () => {
        const __this = this
        const goodsId = this.props.params.id

        let goodsItem = {}
        let fileList = []

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

        if (goodsId) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    action: 'getMiniBarGoods',
                    extension: goodsId
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        goodsItem = res.response.extension || {}
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        this.setState({
            goodsItem: goodsItem,
            fileList: fileList
        })
    }
    _listMinibarGoods = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listMiniBarGoods',
                options: 'extension,goods_name'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const minibarGoodsList = res.response.minibar_goods || []

                    let minibarGoodsNameList = []
                    let minibarGoodsExtensionList = []
                    let currentGoodsId = this.props.params.id

                    for (let i = 0; i < minibarGoodsList.length; i++) {
                        if (minibarGoodsList[i].extension !== currentGoodsId) {
                            minibarGoodsExtensionList.push(minibarGoodsList[i].extension)
                            minibarGoodsNameList.push(minibarGoodsList[i].goods_name)
                        }
                    }

                    this.setState({
                        minibarGoodsExtensionList: minibarGoodsExtensionList,
                        minibarGoodsNameList: minibarGoodsNameList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _gotoPrompt = () => {
        const __this = this
        const { formatMessage } = this.props.intl

        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG28"})})}} ></span>,
            onOk() {
                browserHistory.push('/pbx-settings/voicePrompt/2')
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
        const goodsId = this.props.params.id

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        let errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = values

                if (goodsId) {
                    action.action = 'updateMiniBarGoods'
                    action.extension = goodsId
                } else {
                    action.action = 'addMiniBarGoods'
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

        const formItemPromptLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 9 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG5050"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG5050"}) }))

        const goodsItem = this.state.goodsItem || {}

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
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4341" /> }>
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
                                        Validator.minlength(data, value, callback, formatMessage, 2)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 18)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkGoodsExtension
                                }],
                                width: 100,
                                initialValue: goodsItem.extension
                            })(
                                <Input maxLength="18" disabled={ this.props.params.id ? true : false } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_goods_name"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG135" /> }>
                                    <span>{ formatMessage({id: "LANG135"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('goods_name', {
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
                                }, {
                                    validator: this._checkGoodsName
                                }],
                                width: 100,
                                initialValue: goodsItem.goods_name
                            })(
                                <Input maxLength="64" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_prompt_success"
                            { ...formItemPromptLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5053" /> }>
                                    <span>{ formatMessage({id: "LANG5053"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={ 16 }>
                            { getFieldDecorator('prompt_success', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                width: 100,
                                initialValue: goodsItem.prompt_success ? goodsItem.prompt_success : ""
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
                        </FormItem>
                        <FormItem
                            ref="div_prompt_error"
                            { ...formItemPromptLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5054" /> }>
                                    <span>{ formatMessage({id: "LANG5054"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={ 16 }>
                            { getFieldDecorator('prompt_error', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                width: 100,
                                initialValue: goodsItem.prompt_error ? goodsItem.prompt_error : ""
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
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(GoodsItem))
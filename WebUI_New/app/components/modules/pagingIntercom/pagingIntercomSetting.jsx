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
import { Form, Input, message, Transfer, Tooltip, Select, Checkbox, Col, Row, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class PagingIntercomItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fileList: [],
            pagingIntercomItem: {}
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
    _getInitData = () => {
        let fileList = []
        let pagingIntercom = {}
        const { formatMessage } = this.props.intl
        const __this = this

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listFile',
                type: 'ivr',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["mp3","wav","gsm","ulaw","alaw"]}',
                sidx: 'n',
                sord: 'desc'
            },
            type: 'json',
            async: false,
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
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getPaginggroupSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    pagingIntercom = res.response.paginggroup_settings || {}
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            fileList: fileList,
            pagingIntercomItem: pagingIntercom
        })
    }
    _gotoFeatureCode = () => {
        const { formatMessage } = this.props.intl
        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG610"})})}} ></span>,
            onOk() {
               browserHistory.push('/call-features/featureCode')
            },
            onCancel() {},
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
        })
    }
    _gotoPrompt = () => {
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
        browserHistory.push('/call-features/pagingIntercom')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const paginggroupId = this.props.params.id

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

                action.action = 'updatePaginggroupSettings'

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
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const pagingIntercomItem = this.state.pagingIntercomItem || {}

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const formItemPromptLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 9 }
        }

        const title = formatMessage({id: "LANG746"})

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
                        <div className='section-title'>
                            { formatMessage({id: 'LANG1167'}) }
                        </div>
                        <Row className="row-section-content">
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG1165" />}>
                                        <span>{formatMessage({id: "LANG1164"})}</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('paging_header', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.alphanumeric(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: pagingIntercomItem.paging_header ? pagingIntercomItem.paging_header : "Intercom"
                                })(
                                    <Input placeholder={ formatMessage({id: "LANG135"}) } maxLength='64'/>
                                ) }
                            </FormItem>
                        </Row>
                        <div className='section-title'>
                            { formatMessage({id: 'LANG1166'}) }
                        </div>
                        <Row className="row-section-content">
                            <FormItem
                                { ...formItemPromptLayout }
                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG3490" />}>
                                        <span>{formatMessage({id: "LANG28"})}</span>
                                    </Tooltip>
                                )}
                            >
                                <Col span={16}>
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
                                <Col span={6} offset={1}>
                                    <a className="prompt_setting" onClick={ this._gotoPrompt } >{ formatMessage({id: "LANG1484"}) }</a>
                                </Col>
                            </FormItem>
                        </Row>
                        <Row>
                            <span>{ formatMessage({id: "LANG130"}) }</span>
                            <a className="prompt_setting" onClick={ this._gotoFeatureCode } title={ formatMessage({id: "LANG131"}) }>{ formatMessage({id: "LANG610"}) }</a>
                            <span>{ formatMessage({id: "LANG1168"}) }</span>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(PagingIntercomItem))

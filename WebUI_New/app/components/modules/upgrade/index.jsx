'use strict'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, message, Tooltip, Select, Upload, Icon, Spin, Modal } from 'antd'
import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

const FormItem = Form.Item
const Option = Select.Option

class Upgrade extends Component {
    constructor(props) {
        super(props)
        this.state = {
            upgrade: {},
            loading: false
        }
    }
    componentDidMount() {
        this._getUpgradeValue()
    }
    _getUpgradeValue = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getUpgradeValue' },
            type: 'json',
            async: false,
            success: function(res) {
                let upgrade = res.response

                this.setState({
                    upgrade: upgrade,
                    upgradeLoading: true
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        browserHistory.push('/maintenance/upgrade')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl

        console.log('Received values of form: ')
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = values

                action.action = 'setUpgradeValue'

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                        }
                    }.bind(this)
                })
            }
        })
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    // Not Called
    // function preupload() {
    //     var checkFlag = false;

    //     $.ajax({
    //         type: 'POST',
    //         url: '../preupload?type=firmware',
    //         async: false,
    //         success: function(t) {
    //             if (typeof t == "string" && t.indexOf("Authentication failed") !== -1) {
    //                 UCMGUI.logoutFunction.doLogout();
    //                 return;
    //             }

    //             // take out blank space
    //             t = t.trim().toLowerCase();

    //             if (t.endsWith("0") || t.endsWith("ok")) {
    //                 checkFlag = true;
    //             }
    //         }
    //     });

    //     return checkFlag;
    // }

    // Parse response code, return the corresponding text.
    _transcode = (rescode) => {
        const { formatMessage } = this.props.intl
        if (!isNaN(rescode)) {
            let resultCode = parseInt(rescode)

            switch (resultCode) {
                case 0:
                    return message.error(formatMessage({id: "LANG961"}))
                case 236:
                    return message.error(formatMessage({id: "LANG962"}))
                case 238:
                    return message.error(formatMessage({id: "LANG963"}))
                case 239:
                    return message.error(formatMessage({id: "LANG964"}))
                case 240:
                    return message.error(formatMessage({id: "LANG965"}))
                case 241:
                    return message.error(formatMessage({id: "LANG966"}))
                case 242:
                    return message.error(formatMessage({id: "LANG967"}))
                case 243:
                case 253:
                    return message.error(formatMessage({id: "LANG968"}))
                case 244:
                case 254:
                    return message.error(formatMessage({id: "LANG969"}))
                case 245:
                    return message.error(formatMessage({id: "LANG970"}))
                case 246:
                    return message.error(formatMessage({id: "LANG971"}))
                case 247:
                case 248:
                    return message.error(formatMessage({id: "LANG972"}))
                case 249:
                case 250:
                case 255:
                    return message.error(formatMessage({id: "LANG973"}))
                case 251:
                    return message.error(formatMessage({id: "LANG974"}))
                case 252:
                    return message.error(formatMessage({id: "LANG975"}))
                default:
                    return message.error(formatMessage({id: "LANG976"}))
            }
        } else {
            return message.error(formatMessage({id: "LANG976"}))
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const me = this

        let upgrade = this.state.upgrade || {}
        let via = upgrade['upgrade-via']
        let path = upgrade['firmware-server-path']
        let prefix = upgrade['firmware-file-prefix']
        let suffix = upgrade['firmware-file-suffix']
        let username = upgrade.username
        let password = upgrade.password

        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 1: formatMessage({id: "LANG619"})
        })

        const uploadProps = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=firmware',
            showUploadList: false,
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                // console.log(info.file.status)
                // if (info.file.status !== 'uploading') {
                //     console.log(info.file, info.fileList)
                // }

                if (info.file.status === 'removed') {
                    return
                }

                if (me.state.upgradeLoading) {
                    me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG979"})})
                    me.state.upgradeLoading = false
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response
                    if (data) {
                        let status = data.status,
                            response = data.response

                        me.props.setSpinLoading({loading: false})

                        if (data.status === 0 && response && response.result === 0) {
                            Modal.confirm({
                                content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG924" })}}></span>,
                                okText: 'OK',
                                cancelText: 'Cancel',
                                onOk: () => {
                                    me.setState({
                                        visible: false
                                    })
                                    UCMGUI.loginFunction.confirmReboot()
                                },
                                onCancel: () => {
                                    me.setState({
                                        visible: false
                                    })
                                }
                            })
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (!_.isEmpty(response)) {
                            me._transcode(response.result)
                            // message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                    me.state.upgradeLoading = true
                } else if (info.file.status === 'error') {
                    me.props.setSpinLoading({loading: false})
                    message.error(`${info.file.name} file upload failed.`)
                    me.state.upgradeLoading = true
                }
            },
            onRemove() {
                me.props.setSpinLoading({loading: false})
                message.destroy()
            }
        }
        const container = (
            <Form>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <span>
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1270" /> }>
                                <span>{ formatMessage({id: "LANG1269"}) }</span>
                            </Tooltip>
                        </span>
                    )}>
                    { getFieldDecorator('upgrade-via', {
                        initialValue: via
                    })(
                        <Select>
                            <Option value="0">{ formatMessage({id: "LANG216"}) }</Option>
                            <Option value="1">{ formatMessage({id: "LANG217"}) }</Option>
                            <Option value="2">{ formatMessage({id: "LANG218"}) }</Option>
                        </Select>
                    ) }
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <span>
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1272" /> }>
                                <span>{ formatMessage({id: "LANG1271"}) }</span>
                            </Tooltip>
                        </span>
                    )}>
                    { getFieldDecorator('firmware-server-path', {
                        getValueFromEvent: (e) => {
                            return UCMGUI.toggleErrorMessage(e)
                        },
                        rules: [{
                            validator: (data, value, callback) => {
                                value === '' ? callback() : Validator.urlWithoutProtocol(data, value, callback, formatMessage, "LANG1271")
                            }
                        }],
                        initialValue: path
                    })(
                        <Input />
                    ) }
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <span>
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1274" /> }>
                                <span>{ formatMessage({id: "LANG1273"}) }</span>
                            </Tooltip>
                        </span>
                    )}>
                    { getFieldDecorator('firmware-file-prefix', {
                        getValueFromEvent: (e) => {
                            return UCMGUI.toggleErrorMessage(e)
                        },
                        rules: [{
                            validator: (data, value, callback) => {
                                value === '' ? callback() : Validator.specialStr(data, value, callback, formatMessage)
                            }
                        }],
                        initialValue: prefix
                    })(
                        <Input />
                    ) }
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <span>
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1276" /> }>
                                <span>{ formatMessage({id: "LANG1275"}) }</span>
                            </Tooltip>
                        </span>
                    )}>
                    { getFieldDecorator('firmware-file-suffix', {
                        getValueFromEvent: (e) => {
                            return UCMGUI.toggleErrorMessage(e)
                        },
                        rules: [{
                            validator: (data, value, callback) => {
                                value === '' ? callback() : Validator.specialStr(data, value, callback, formatMessage)
                            }
                        }],
                        initialValue: suffix
                    })(
                        <Input />
                    ) }
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <span>
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1278" /> }>
                                <span>{ formatMessage({id: "LANG1277"}) }</span>
                            </Tooltip>
                        </span>
                    )}>
                    <Input name="username" className="hidden"></Input>
                    { getFieldDecorator('username', {
                        rules: [],
                        initialValue: username
                    })(
                        <Input />
                    ) }
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <span>
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1280" /> }>
                                <span>{ formatMessage({id: "LANG1279"}) }</span>
                            </Tooltip>
                        </span>
                    )}>
                    <Input type="password" name="password" className="hidden"></Input>
                    { getFieldDecorator('password', {
                        rules: [],
                        initialValue: password
                    })(
                        <Input type="password"/>
                    ) }
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={(
                        <span>
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1285" /> }>
                                <span>{ formatMessage({id: "LANG1284"}) }</span>
                            </Tooltip>
                        </span>
                    )}>
                    { getFieldDecorator('upload', {
                        valuePropName: 'fileList',
                        normalize: this._normFile
                    })(
                        <Upload {...uploadProps}>
                            <Button type="ghost">
                                <Icon type="upload" /> { formatMessage({id: "LANG1607"}) }
                            </Button>
                        </Upload>
                    ) }
                </FormItem>
            </Form>
        )
        return (
            <div className="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG619"}) } onSubmit={ this._handleSubmit } onCancel={ this._handleCancel } isDisplay='display-block' />
                <Spin spinning={this.state.loading}>{container}</Spin>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(Upgrade)))

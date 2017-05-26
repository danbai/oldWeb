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
import { BackTop, Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip, Button } from 'antd'

import Editor from 'react-umeditor'

const FormItem = Form.Item
const Option = Select.Option

class EmailTemplate extends Component {
    constructor(props) {
        super(props)

        this.state = {
            settings: [],
            mailPreview: '',
            txt_content: '',
            html_content: '',
            emailSubject: '',
            emailType: {
                'cdr': 'LANG7',
                'fax': 'LANG95',
                'account': 'LANG85',
                'alert': 'LANG2553',
                'voicemail': 'LANG20',
                'password': 'LANG2810',
                'conference': 'LANG3775',
                'sip_account': 'LANG2927',
                'iax_account': 'LANG2928',
                'fxs_account': 'LANG2929'
            },
            subjectType: {
                'cdr': 'cdr_subject',
                'fax': 'fax_subject',
                'alert': 'alert_subject',
                'account': 'account_subject',
                'password': 'password_subject',
                'voicemail': 'voicemail_subject',
                'conference': 'conference_subject',
                'sip_account': 'sip_account_subject',
                'iax_account': 'iax_account_subject',
                'fxs_account': 'fxs_account_subject'
            },
            fileType: this.props.params.type
        }
    }
    componentDidMount() {
        let type = this.state.fileType

        this._getHTMLTemplate(type)
        this._getTextTemplate(type)
        this._getMailSubject(type)
        this._getMailHTMLPreview(type)
    }
    componentWillMount() {
    }
    _getMailSubject = (type) => {
        const { formatMessage } = this.props.intl

        let action = {}

        action['action'] = 'getMailSubject'
        action[this.state.subjectType[type]] = ''

        $.ajax({
            data: action,
            type: 'post',
            url: api.apiHost,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const settings = response.mail_subject_settings || []

                    let emailSubject = settings[this.state.subjectType[type]]

                    this.setState({
                        emailSubject: emailSubject
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getMailHTMLPreview = (type) => {
        const { formatMessage } = this.props.intl

        let action = {}

        action['mail_preview'] = type
        action['action'] = 'getMailHtml'

        $.ajax({
            data: action,
            type: 'post',
            url: api.apiHost,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const mailPreview = response.mail_preview || []

                    this.setState({
                        mailPreview: mailPreview
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getHTMLTemplate = (type) => {
        $.ajax({
            type: 'GET',
            dataType: 'html',
            url: '/mail_template/' + type + '_template.html',
            success: function(data) {
                this.setState({
                    html_content: data
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getTextTemplate = (type) => {
        const { setFieldsValue } = this.props.form

        $.ajax({
            type: 'GET',
            dataType: 'html',
            url: '/mail_template/' + type + '_template.txt',
            success: function(data) {
                setFieldsValue({
                    txt_content: data
                })

                this.setState({
                    txt_content: data
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getIcons = () => {
        let icons = [
            'undo', 'redo', '|',
            'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'removeformat', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
            // 'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
            'paragraph', 'fontfamily', 'fontsize', '|',
            'indent', 'justifyleft', 'justifycenter', 'justifyright', '|', 'touppercase', 'tolowercase'
            // '|', 'link', 'unlink'
        ]

        return icons
    }
    _handleCancel = (e) => {
        browserHistory.push('/system-settings/emailSettings/template')
    }
    _handleSubmit = (e) => {
        // e.preventDefault()
        const form = this.props.form
        const { formatMessage } = this.props.intl

        form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                message.loading(formatMessage({ id: "LANG826" }), 0)

                let subjectAction = {
                        'action': 'updateMailSubject'
                    },
                    action = {
                        'action': 'writeMailTemplate',
                        'module': this.state.fileType
                    }

                action['txt_content'] = values.txt_content
                action['html_content'] = this.state.html_content
                // action['html_content'] = this.refs.editor.getContent()
                subjectAction[this.state.subjectType[this.state.fileType]] = values.emailSubject

                $.ajax({
                    type: 'post',
                    url: api.apiHost,
                    data: subjectAction,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            $.ajax({
                                type: 'post',
                                data: action,
                                url: api.apiHost,
                                error: function(e) {
                                    message.error(e.statusText)
                                },
                                success: function(data) {
                                    var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                    if (bool) {
                                        message.destroy()
                                        message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG844" })}}></span>, 2)

                                        this._handleCancel()
                                    }
                                }.bind(this)
                            })
                        }
                    }.bind(this)
                })
            }
        })
    }
    _restoreMailTemplate = (mode) => {
        let type = this.state.fileType
        let isHTMLFormat = (mode === 'html' ? true : false)

        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                'action': (isHTMLFormat ? 'restoreHtmlMailTemplate' : 'restoreTextMailTemplate'),
                'mail_template': type
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    if (isHTMLFormat) {
                        this._getHTMLTemplate(type)
                    } else {
                        this._getTextTemplate(type)
                    }

                    this._getMailSubject(type)
                }
            }.bind(this)
        })
    }
    _previewMailTemplate = () => {
        let HTMLContent = this.state.mailPreview

        let editContent = this.state.html_content,
            w = window.open('', '_blank', ''),
            d = w.document

        d.open()

        d.write(HTMLContent)

        if (d.getElementById('content')) {
            d.getElementById('content').innerHTML = editContent
        }

        d.close()
    }
    _handleEditorChange = (content) => {
        this.setState({
            html_content: content
        })
    }
    render() {
        const form = this.props.form
        const icons = this._getIcons()
        const fileType = this.state.fileType
        const { formatMessage } = this.props.intl
        const settings = this.state.settings || {}
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const title = formatMessage({ id: "LANG222" }, {
                        0: formatMessage({ id: "LANG4576" }),
                        1: formatMessage({ id: this.state.emailType[this.props.params.type] })
                    })

        document.title = formatMessage({ id: "LANG584" }, {
                    0: model_info.model_name,
                    1: title
                })

        const formItemRowLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        }

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    isDisplay='display-block'
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit.bind(this) }
                />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemRowLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1524" /> }>
                                    <span>{ formatMessage({id: "LANG1524"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('emailSubject', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: this.state.emailSubject
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemRowLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5377" /> }>
                                    <span>{ formatMessage({id: "LANG5377"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('txt_content', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: this.state.txt_content
                            })(
                                <Input type="textarea" rows={ 10 } />
                            ) }
                        </FormItem>
                        <Row>
                            <Col span={ 20 } offset={ 4 }>
                                <FormItem>
                                    <Button type="primary" onClick={ this._restoreMailTemplate.bind(this, "text") }>{formatMessage({id: "LANG4749"})}</Button>
                                </FormItem>
                            </Col>
                        </Row>
                        <FormItem
                            { ...formItemRowLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5376" /> }>
                                    <span>{ formatMessage({id: "LANG5376"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Editor
                                ref="editor" 
                                icons={ icons }
                                value={ this.state.html_content || fileType }
                                onChange={ this._handleEditorChange.bind(this) }
                            />
                        </FormItem>
                        <Row>
                            <Col span={ 20 } offset={ 4 }>
                                <FormItem>
                                    <Button type="primary" onClick={ this._previewMailTemplate}>{formatMessage({id: "LANG3479"})}</Button>
                                    <Button type="primary" onClick={ this._restoreMailTemplate.bind(this, "html") }>{formatMessage({id: "LANG4749"})}</Button>
                                </FormItem>
                            </Col>
                        </Row>
                        <FormItem
                            { ...formItemRowLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1525" /> }>
                                    <span>{ formatMessage({id: "LANG1525"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <div
                                className={ fileType === 'account' ? 'display-block' : 'hidden' }
                            >
                                <ul>
                                    <li>{ `\$\{SERVR_ADDR\} : ` }<span>{ formatMessage({id: "LANG4707"}) }</span></li>
                                    <li>{ `\$\{PUB_ADDR\} : ` }<span>{ formatMessage({id: "LANG4708"}) }</span></li>
                                    <li>{ `\$\{ACNT_NAME\} : ` }<span>{ formatMessage({id: "LANG4709"}) }</span></li>
                                    <li>{ `\$\{SIP_ID\} : ` }<span>{ formatMessage({id: "LANG4710"}) }</span></li>
                                    <li>{ `\$\{AUTH_ID\} : ` }<span>{ formatMessage({id: "LANG4711"}) }</span></li>
                                    <li>{ `\$\{AUTH_PWD\} : ` }<span>{ formatMessage({id: "LANG4712"}) }</span></li>
                                    <li>{ `\$\{USR_PWD\} : ` }<span>{ formatMessage({id: "LANG4713"}) }</span></li>
                                    <li>{ `\$\{SERVR_QR_IMG\} : ` }<span>{ formatMessage({id: "LANG4714"}) }</span></li>
                                    <li>{ `\$\{SERVR_PUB_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4715"}) }</span></li>
                                    <li>{ `\$\{LDAP_PATH\} : ` }<span>{ formatMessage({id: "LANG4716"}) }</span></li>
                                    <li>{ `\$\{LDAP_SERVR_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4717"}) }</span></li>
                                    <li>{ `\$\{LDAP_SERVR_PUB_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4718"}) }</span></li>
                                </ul>
                            </div>
                            <div
                                className={ fileType === 'sip_account' ? 'display-block' : 'hidden' }
                            >
                                <ul>
                                    <li>{ `\$\{SERVR_ADDR\} : ` }<span>{ formatMessage({id: "LANG4707"}) }</span></li>
                                    <li>{ `\$\{PUB_ADDR\} : ` }<span>{ formatMessage({id: "LANG4708"}) }</span></li>
                                    <li>{ `\$\{ACNT_NAME\} : ` }<span>{ formatMessage({id: "LANG4709"}) }</span></li>
                                    <li>{ `\$\{SIP_ID\} : ` }<span>{ formatMessage({id: "LANG4710"}) }</span></li>
                                    <li>{ `\$\{AUTH_ID\} : ` }<span>{ formatMessage({id: "LANG4711"}) }</span></li>
                                    <li>{ `\$\{AUTH_PWD\} : ` }<span>{ formatMessage({id: "LANG4712"}) }</span></li>
                                    <li>{ `\$\{USR_PWD\} : ` }<span>{ formatMessage({id: "LANG4713"}) }</span></li>
                                    <li>{ `\$\{SERVR_QR_IMG\} : ` }<span>{ formatMessage({id: "LANG4714"}) }</span></li>
                                    <li>{ `\$\{SERVR_PUB_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4715"}) }</span></li>
                                    <li>{ `\$\{LDAP_PATH\} : ` }<span>{ formatMessage({id: "LANG4716"}) }</span></li>
                                    <li>{ `\$\{LDAP_SERVR_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4717"}) }</span></li>
                                    <li>{ `\$\{LDAP_SERVR_PUB_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4718"}) }</span></li>
                                </ul>
                            </div>
                            <div
                                className={ fileType === 'iax_account' ? 'display-block' : 'hidden' }
                            >
                                <ul>
                                    <li>{ `\$\{SERVR_ADDR\} : ` }<span>{ formatMessage({id: "LANG4707"}) }</span></li>
                                    <li>{ `\$\{PUB_ADDR\} : ` }<span>{ formatMessage({id: "LANG4708"}) }</span></li>
                                    <li>{ `\$\{ACNT_NAME\} : ` }<span>{ formatMessage({id: "LANG4709"}) }</span></li>
                                    <li>{ `\$\{SIP_ID\} : ` }<span>{ formatMessage({id: "LANG4710"}) }</span></li>
                                    <li>{ `\$\{AUTH_ID\} : ` }<span>{ formatMessage({id: "LANG4711"}) }</span></li>
                                    <li>{ `\$\{AUTH_PWD\} : ` }<span>{ formatMessage({id: "LANG4712"}) }</span></li>
                                    <li>{ `\$\{USR_PWD\} : ` }<span>{ formatMessage({id: "LANG4713"}) }</span></li>
                                    <li>{ `\$\{SERVR_QR_IMG\} : ` }<span>{ formatMessage({id: "LANG4714"}) }</span></li>
                                    <li>{ `\$\{SERVR_PUB_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4715"}) }</span></li>
                                    <li>{ `\$\{LDAP_PATH\} : ` }<span>{ formatMessage({id: "LANG4716"}) }</span></li>
                                    <li>{ `\$\{LDAP_SERVR_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4717"}) }</span></li>
                                    <li>{ `\$\{LDAP_SERVR_PUB_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4718"}) }</span></li>
                                </ul>
                            </div>
                            <div
                                className={ fileType === 'fxs_account' ? 'display-block' : 'hidden' }
                            >
                                <ul>
                                    <li>{ `\$\{SERVR_ADDR\} : ` }<span>{ formatMessage({id: "LANG4707"}) }</span></li>
                                    <li>{ `\$\{PUB_ADDR\} : ` }<span>{ formatMessage({id: "LANG4708"}) }</span></li>
                                    <li>{ `\$\{ACNT_NAME\} : ` }<span>{ formatMessage({id: "LANG4709"}) }</span></li>
                                    <li>{ `\$\{SIP_ID\} : ` }<span>{ formatMessage({id: "LANG4710"}) }</span></li>
                                    <li>{ `\$\{AUTH_ID\} : ` }<span>{ formatMessage({id: "LANG4711"}) }</span></li>
                                    <li>{ `\$\{AUTH_PWD\} : ` }<span>{ formatMessage({id: "LANG4712"}) }</span></li>
                                    <li>{ `\$\{USR_PWD\} : ` }<span>{ formatMessage({id: "LANG4713"}) }</span></li>
                                    <li>{ `\$\{SERVR_QR_IMG\} : ` }<span>{ formatMessage({id: "LANG4714"}) }</span></li>
                                    <li>{ `\$\{SERVR_PUB_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4715"}) }</span></li>
                                    <li>{ `\$\{LDAP_PATH\} : ` }<span>{ formatMessage({id: "LANG4716"}) }</span></li>
                                    <li>{ `\$\{LDAP_SERVR_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4717"}) }</span></li>
                                    <li>{ `\$\{LDAP_SERVR_PUB_ADDR_QR\} : ` }<span>{ formatMessage({id: "LANG4718"}) }</span></li>
                                </ul>
                            </div>
                            <div
                                className={ fileType === 'cdr' ? 'display-block' : 'hidden' }
                            >
                                <ul>
                                    <li>{ `\$\{CDR_NUMBERS\} : ` }<span>{ formatMessage({id: "LANG4703"}) }</span></li>
                                    <li>{ `\$\{START_TIME\} : ` }<span>{ formatMessage({id: "LANG4704"}) }</span></li>
                                    <li>{ `\$\{END_TIME\} : ` }<span>{ formatMessage({id: "LANG4705"}) }</span></li>
                                </ul>
                            </div>
                            <div
                                className={ fileType === 'conference' ? 'display-block' : 'hidden' }
                            >
                                <ul>
                                    <li>{ `\$\{CNF_ACTION\} : ` }<span>{ formatMessage({id: "LANG4691"}) }</span></li>
                                    <li>{ `\$\{CNF_THEME\} : ` }<span>{ formatMessage({id: "LANG4692"}) }</span></li>
                                    <li>{ `\$\{CNF_STARTTIME\} : ` }<span>{ formatMessage({id: "LANG4693"}) }</span></li>
                                    <li>{ `\$\{CNF_ENDTIME\} : ` }<span>{ formatMessage({id: "LANG4694"}) }</span></li>
                                    <li>{ `\$\{CNF_ZONE\} : ` }<span>{ formatMessage({id: "LANG2058"}) }</span></li>
                                    <li>{ `\$\{HELLO\} : ` }<span>{ formatMessage({id: "LANG4696"}) }</span></li>
                                    <li>{ `\$\{CNFR_MSG\} : ` }<span>{ formatMessage({id: "LANG4697"}) }</span></li>
                                    <li>{ `\$\{CNFR_TOPIC\} : ` }<span>{ formatMessage({id: "LANG4698"}) }</span></li>
                                    <li>{ `\$\{CNFR_DESCRIPTION\} : ` }<span>{ formatMessage({id: "LANG4699"}) }</span></li>
                                    <li>{ `\$\{CNFR_PASSWORD\} : ` }<span>{ formatMessage({id: "LANG4700"}) }</span></li>
                                    <li>{ `\$\{CNFR_WHERE\} : ` }<span>{ formatMessage({id: "LANG4701"}) }</span></li>
                                    <li>{ `\$\{CNFR_WHEN\} : ` }<span>{ formatMessage({id: "LANG4702"}) }</span></li>
                                    <li>{ `\$\{CNFR_MEMBERS\} : ` }<span>{ formatMessage({id: "LANG4695"}) }</span></li>
                                </ul>
                            </div>
                            <div
                                className={ fileType === 'alert' ? 'display-block' : 'hidden' }
                            >
                                <ul>
                                    <li>{ `\$\{MAC\} : ` }<span>{ formatMessage({id: "LANG154"}) }</span></li>
                                    <li>{ `\$\{WARNING_MSG\} : ` }<span>{ formatMessage({id: "LANG4690"}) }</span></li>
                                </ul>
                            </div>
                            <div
                                className={ fileType === 'fax' ? 'display-block' : 'hidden' }
                            >
                                <ul>
                                    <li>{ `\$\{CALLERIDNUM\} : ` }<span>{ formatMessage({id: "LANG2251"}) }</span></li>
                                    <li>{ `\$\{CALLERIDNAME\} : ` }<span>{ formatMessage({id: "LANG2272"}) }</span></li>
                                    <li>{ `\$\{RECEIVEEXTEN\} : ` }<span>{ formatMessage({id: "LANG2274"}) }</span></li>
                                    <li>{ `\$\{FILENAME\} : ` }<span>{ formatMessage({id: "LANG4488"}) }</span></li>
                                    <li>{ `\$\{FAXPAGES\} : ` }<span>{ formatMessage({id: "LANG2243"}) }</span></li>
                                    <li>{ `\$\{FAXDATE\} : ` }<span>{ formatMessage({id: "LANG2269"}) }</span></li>
                                </ul>
                            </div>
                            <div
                                className={ fileType === 'password' ? 'display-block' : 'hidden' }
                            >
                                <ul>
                                    <li>{ `\$\{USER\} : ` }<span>{ formatMessage({id: "LANG2809"}) }</span></li>
                                    <li>{ `\$\{PASSWORD\} : ` }<span>{ formatMessage({id: "LANG2810"}) }</span></li>
                                </ul>
                            </div>
                            <div
                                className={ fileType === 'voicemail' ? 'display-block' : 'hidden' }
                            >
                                <ul>
                                    <li>{ `\$\{VM_NAME\} : ` }<span>{ formatMessage({id: "LANG1526"}) }</span></li>
                                    <li>{ `\$\{VM_DUR\} : ` }<span>{ formatMessage({id: "LANG1527"}) }</span></li>
                                    <li>{ `\$\{VM_MAILBOX\} : ` }<span>{ formatMessage({id: "LANG1528"}) }</span></li>
                                    <li>{ `\$\{VM_CALLERID\} : ` }<span>{ formatMessage({id: "LANG1529"}) }</span></li>
                                    <li>{ `\$\{VM_MSGNUM\} : ` }<span>{ formatMessage({id: "LANG1530"}) }</span></li>
                                    <li>{ `\$\{VM_DATE\} : ` }<span>{ formatMessage({id: "LANG1531"}) }</span></li>
                                </ul>
                            </div>
                        </FormItem>
                    </Form>
                </div>
                <BackTop />
            </div>
        )
    }
}

export default Form.create()(injectIntl(EmailTemplate))

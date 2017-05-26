'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import SMTP from './smtpSettings'
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import EmailSendLog from './emailSendLog'
import EmailTemplateList from './emailTemplateList'

import { Form, Input, Tabs, message, Modal } from 'antd'
import React, { Component, PropTypes } from 'react'
import { injectIntl, formatMessage } from 'react-intl'

const TabPane = Tabs.TabPane
const confirm = Modal.confirm

class EmailSettings extends Component {
    constructor(props) {
        super(props)

        this.state = {
            web_https: 1,
            isDisplay: this.props.params.tab === 'settings' || !this.props.params.tab ? 'display-block' : 'hidden',
            activeKey: this.props.params.tab ? this.props.params.tab : 'settings',
            smtpLoad: false
        }
    }
    componentDidMount() {
        this._getHttpServer()
    }
    componentWillUnmount() {
    }
    _getHttpServer = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'getHttpServer',
                web_https: ''
            },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(res) {
                var bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const httpserver = response.httpserver
                    const web_https = httpserver.web_https

                    this.setState({
                        web_https: web_https
                    })
                }
            }.bind(this)
        })
    }
    _onChange = (e) => {
        if (e === "settings") {
            this.setState({
                activeKey: e,
                isDisplay: "display-block"
            })
        } else {
            this.setState({
                activeKey: e,
                isDisplay: "hidden"
            })
        }
    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl
        const me = this

        this.props.form.validateFields({ force: true }, (err, values) => {
            let a = err
            let b = values

            if (!err || (err && err.hasOwnProperty('recipients'))) {
                console.log('Received values of form: ', values)

                let action = {}

                for (let item in values) {
                    if (values[item]) {
                        action[item] = values[item]
                    }
                }

                action.smtp_tls_enable = action.smtp_tls_enable ? 'yes' : 'no'
                action.enable_auth = action.enable_auth ? 'yes' : 'no'
                action.action = "updateEmailSettings"
 
                delete action.recipients
                
                if (this.state.web_https === 0) {
                    confirm({
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG937"})}} ></span>,
                        onOk() {
                            message.loading(formatMessage({ id: "LANG826" }), 0)
                            $.ajax({
                                url: api.apiHost,
                                method: "post",
                                data: action,
                                type: 'json',
                                error: function(e) {
                                    message.error(e.statusText)
                                },
                                success: function(data) {
                                    var bool = UCMGUI.errorHandler(data, null, me.props.intl.formatMessage)

                                    if (bool) {
                                        message.destroy()
                                        message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                                    }
                                }.bind(this)
                            })
                        },
                        onCancel() {
                            message.destroy()
                        },
                        okText: formatMessage({id: "LANG727"}),
                        cancelText: formatMessage({id: "LANG726"})
                    })
                } else {
                    message.loading(formatMessage({ id: "LANG826" }), 0)
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
            }
        })
    }
    _handleCancel = () => {
        this.props.form.resetFields()
        this.setState({
            smtpLoad: true
        })
    }
    _setSmtpLoad = (e) => {
        this.setState({
            smtpLoad: e
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG717"})
                })

        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    onCancel={ this._handleCancel } 
                    isDisplay={ this.state.isDisplay }
                    onSubmit={ this._handleSubmit.bind(this) } 
                    headerTitle={ formatMessage({id: "LANG717"}) } 
                />
                <div className="ant-form form-contain-tab">
                    <Tabs
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChange }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={formatMessage({id: "LANG717"})} key="settings">
                            <SMTP
                                form={ this.props.form } 
                                smtpLoad={this.state.smtpLoad}
                                setSmtpLoad={this._setSmtpLoad}
                            />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG4572"})} key="template">
                            <EmailTemplateList />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG5382"})} key="log">
                            <EmailSendLog />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}

EmailSettings.propTypes = {
}

export default Form.create()(injectIntl(EmailSettings))

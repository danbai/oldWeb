'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, message, Popconfirm, Tooltip, Row, Col} from 'antd'

const FormItem = Form.Item

class GoogleSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            authorBlank: true,
            authorHref: ''
        }
    }
    componentDidMount() {
        this._getCalenderSettings()
    }
    _calendarSettings = () => {
        browserHistory.push('/call-features/conference/calendarSettings')
    }
    _authSettings = () => {
        browserHistory.push('/call-features/conference/authSettings')
    }
    _getAuthorUrl = () => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'updateOauthJsonFile',
                client_name: 'calendar'
            },
            dataType: 'json',
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    var res = data.response.result,
                        openRes = window.open(res, '_blank')

                    if (!openRes) {
                        this.setState({
                            authorHref: res,
                            authorBlank: false
                        })
                    } else {
                        this.setState({
                            authorBlank: true
                        })
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getCalenderSettings = () => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'getGoogleAccountCal'
            },
            dataType: 'json',
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response.googlecalendar,
                        calendar = res.calendar_name.slice(0, -1)

                    this.setState({
                        google_host: calendar
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _updateCertificate = () => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG844" })}}></span>

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                message.loading(loadingMessage)

                $.ajax({
                    url: api.apiHost,
                    type: "POST",
                    data: {
                        action: 'updateCertificate',
                        client_name: 'calendar',
                        request_code: values.request_code
                    },
                    dataType: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                            this.props.form.setFieldsValue({
                                request_code: ''
                            })
                            this._getCalenderSettings()
                        }
                    }.bind(this)
                })
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }
        const formItemLayoutAuthor = {
            labelCol: { span: 7 },
            wrapperCol: { span: 15 }
        }

        return (
            <div className="app-content-main app-content-conference">
                <div className="content">
                    <div className="top-button">
                        <Button icon="settings" type="primary" size="default" onClick={ this._calendarSettings }>
                            { formatMessage({id: "LANG3516"}) }
                        </Button>
                        <Button icon="settings" type="primary" size="default" onClick={ this._authSettings }>
                            { formatMessage({id: "LANG4390"}) }
                        </Button>
                    </div>
                    <div className="ant-form">
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG4386"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <div>
                                <div className="step-content">
                                    <span className="step">1</span>
                                    <span style={{ marginRight: 20 }}>{ formatMessage({id: "LANG4411"}) }</span>
                                    <Button type="primary" size="default" onClick={ this._getAuthorUrl }>
                                        { formatMessage({id: "LANG4387"}) }
                                    </Button>
                                    <div className={ this.state.authorBlank ? 'hidden' : 'display-inline' } style={{ marginTop: 10 }}>
                                        <span
                                            style={{ marginRight: 10, color: '#7d8a99', fontSize: 12 }}
                                        >
                                            { formatMessage({id: "LANG4388"}) }
                                        </span>
                                        <a href={ this.state.authorHref } target="_blank">{ formatMessage({id: "LANG4387"}) }</a>
                                    </div>
                                </div>
                                <div className="step-content">
                                    <span className="step">2</span>
                                    <span>{ formatMessage({id: "LANG4412"}) }</span>
                                </div>
                                <div className="step-content">
                                    <span className="step">3</span>
                                    <span>{ formatMessage({id: "LANG4413"}) }</span>
                                </div>
                                <div className="step-content" style={{ marginBottom: 20 }}>
                                    <span className="step">4</span>
                                    <span>{ formatMessage({id: "LANG4414"}) }</span>
                                </div>
                                <Form style={{ padding: 0 }}>
                                    <Row>
                                        <Col xl={ 10 } lg={ 17 } md={ 20 } offset={ 1 }>
                                            <FormItem
                                                style={{ marginTop: 10 }}
                                                { ...formItemLayoutAuthor }
                                                label={(
                                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4409" /> }>
                                                        <span>{ formatMessage({id: "LANG3520"}) }</span>
                                                    </Tooltip>
                                                )}
                                            >
                                                { getFieldDecorator('request_code', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: true,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }]
                                                })(
                                                    <Input style={{ width: 400, marginRight: 10 }} />
                                                ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 4 }>
                                            <Button
                                                type="primary"
                                                size="default"
                                                style={{ marginTop: 12 }}
                                                onClick={ this._updateCertificate }
                                            >
                                                { formatMessage({id: "LANG3518"}) }
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                            <Row
                                className={ this.state.google_host ? 'display-block' : 'hidden' }
                                style={{ 
                                    width: 300,
                                    height: 70,
                                    background: '#f3f7fa',
                                    paddingTop: 5,
                                    paddingLeft: 20
                                }}
                            >
                                <div style={{ marginBottom: 5, fontSize: 16, color: '#596680', fontWeight: 'bold' }}>
                                    <span className="sprite sprite-success"></span>
                                    { formatMessage({id: "LANG4201"}, {0: formatMessage({id: "LANG3518"})}) }
                                </div>
                                <div>
                                    <span style={{ marginRight: 5 }}>{ formatMessage({id: "LANG3517"}) }</span>
                                    <span style={{ fontWeight: 'bold' }}>{ this.state.google_host }</span>
                                </div>
                            </Row>
                        </Row>
                    </div>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(GoogleSettings))
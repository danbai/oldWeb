'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Checkbox, message, Tooltip } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Validator from "../../api/validator"
import Title from '../../../views/title'

const FormItem = Form.Item
const portRangeMin = 250

class RTP extends Component {
    constructor(props) {
        super(props)
        this.state = {
            settings: {}
        }
    }
    componentDidMount() {
        // this._getRTPSettings()
        const settings = this.props.settings
        this.setState({
            settings: settings
        })
    }
    _checkRTPStart = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const rtpend = getFieldValue('rtpend')

        if (!value || !rtpend) {
            callback()
        } else if (value.valueOf() > rtpend.valueOf()) {
            callback(formatMessage({id: "LANG2165"}, {0: formatMessage({id: "LANG1618"}), 1: formatMessage({id: "LANG1616"})}))
        } else if (rtpend.valueOf() - value.valueOf() < 250) {
            callback(formatMessage({id: "LANG2388"}, {0: formatMessage({id: "LANG1616"}), 1: formatMessage({id: "LANG1618"}), 2: portRangeMin}))
        } else {
            callback()
        }
    }
    _checkRTPEnd = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const rtpstart = getFieldValue('rtpstart')

        if (!value || !rtpstart) {
            callback()
        } else if (value.valueOf() < rtpstart.valueOf()) {
            callback(formatMessage({id: "LANG2142"}, {0: formatMessage({id: "LANG1616"}), 1: formatMessage({id: "LANG1618"})}))
        } else if (value.valueOf() - rtpstart.valueOf() < 250) {
            callback(formatMessage({id: "LANG2388"}, {0: formatMessage({id: "LANG1616"}), 1: formatMessage({id: "LANG1618"}), 2: portRangeMin}))
        } else {
            callback()
        }
    }
    _checkBFCPStart = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const bfcpend = getFieldValue('bfcpend')

        if (!value || !bfcpend) {
            callback()
        } else if (value.valueOf() > bfcpend.valueOf()) {
            callback(formatMessage({id: "LANG2165"}, {0: formatMessage({id: "LANG4738"}), 1: formatMessage({id: "LANG4739"})}))
        } else if (bfcpend.valueOf() - value.valueOf() < 250) {
            callback(formatMessage({id: "LANG2388"}, {0: formatMessage({id: "LANG4739"}), 1: formatMessage({id: "LANG4738"}), 2: portRangeMin}))
        } else {
            callback()
        }
    }
    _checkBFCPEnd = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const bfcpstart = getFieldValue('bfcpstart')

        if (!value || !bfcpstart) {
            callback()
        } else if (value.valueOf() < bfcpstart.valueOf()) {
            callback(formatMessage({id: "LANG2142"}, {0: formatMessage({id: "LANG4739"}), 1: formatMessage({id: "LANG4738"})}))
        } else if (value.valueOf() - bfcpstart.valueOf() < 250) {
            callback(formatMessage({id: "LANG2388"}, {0: formatMessage({id: "LANG4739"}), 1: formatMessage({id: "LANG4738"}), 2: portRangeMin}))
        } else {
            callback()
        }
    }
    _checkBFCPTCPStart = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const bfcp_tcp_end = getFieldValue('bfcp_tcp_end')

        if (!value || !bfcp_tcp_end) {
            callback()
        } else if (value.valueOf() > bfcp_tcp_end.valueOf()) {
            callback(formatMessage({id: "LANG2165"}, {0: formatMessage({id: "LANG4740"}), 1: formatMessage({id: "LANG4741"})}))
        } else if (bfcp_tcp_end.valueOf() - value.valueOf() < 250) {
            callback(formatMessage({id: "LANG2388"}, {0: formatMessage({id: "LANG4741"}), 1: formatMessage({id: "LANG4740"}), 2: portRangeMin}))
        } else {
            callback()
        }
    }
    _checkBFCPTCPEnd = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const bfcp_tcp_start = getFieldValue('bfcp_tcp_start')

        if (!value || !bfcp_tcp_start) {
            callback()
        } else if (value.valueOf() < bfcp_tcp_start.valueOf()) {
            callback(formatMessage({id: "LANG2142"}, {0: formatMessage({id: "LANG4741"}), 1: formatMessage({id: "LANG4740"})}))
        } else if (value.valueOf() - bfcp_tcp_start.valueOf() < 250) {
            callback(formatMessage({id: "LANG2388"}, {0: formatMessage({id: "LANG4741"}), 1: formatMessage({id: "LANG4740"}), 2: portRangeMin}))
        } else {
            callback()
        }
    }
    _getRTPSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getRTPSettings' },
            type: 'json',
            async: false,
            success: function(res) {
                let response = res.response || {}

                this.setState({
                    settings: response.rtp_settings || {}
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        browserHistory.push('/pbx-settings/rtpSettings')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = values

                action.action = 'updateRTPSettings'
                action.strictrtp = (action.strictrtp ? 'yes' : 'no')
                action.rtpchecksums = (action.rtpchecksums ? 'yes' : 'no')
                action.icesupport = (action.icesupport ? 'yes' : 'no')

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
                            message.success(formatMessage({ id: "LANG815" }))
                        }
                    }.bind(this)
                })
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        let settings = this.state.settings || {}
        let rtpstart = settings.rtpstart
        let rtpend = settings.rtpend
        let strictrtp = (settings.strictrtp === 'yes')
        let rtpchecksums = (settings.rtpchecksums === 'yes')
        let icesupport = (settings.icesupport === 'yes')
        let stunaddr = settings.stunaddr
        let bfcpstart = settings.bfcpstart
        let bfcpend = settings.bfcpend
        let bfcp_tcp_start = settings.bfcp_tcp_start
        let bfcp_tcp_end = settings.bfcp_tcp_end
        let turnaddr = settings.turnaddr
        let turnusername = settings.turnusername
        let turnpassword = settings.turnpassword

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG676"})})

        return (
            <div className="app-content-main">
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1619" /> }>
                                        <span>{ formatMessage({id: "LANG1618"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('rtpstart', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true, message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkRTPStart
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1024, 65535)
                                    }
                                }],
                                initialValue: rtpstart
                            })(
                                <Input min={ 1024 } max={ 65535 } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1617" /> }>
                                        <span>{ formatMessage({id: "LANG1616"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('rtpend', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true, message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkRTPEnd
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1024, 65535)
                                    }
                                }],
                                initialValue: rtpend
                            })(
                                <Input min={ 1024 } max={ 65535 } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1621" /> }>
                                        <span>{ formatMessage({id: "LANG1620"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('strictrtp', {
                                valuePropName: 'checked',
                                initialValue: strictrtp
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1615" /> }>
                                        <span>{ formatMessage({id: "LANG1614"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('rtpchecksums', {
                                valuePropName: 'checked',
                                initialValue: rtpchecksums
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4436" /> }>
                                        <span>{ formatMessage({id: "LANG4394"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('icesupport', {
                                valuePropName: 'checked',
                                initialValue: icesupport
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4437" /> }>
                                        <span>{ formatMessage({id: "LANG1575"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('stunaddr', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: this._checkJBMax
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.host(data, value, callback, formatMessage, 'domain')
                                    }
                                }],
                                initialValue: stunaddr
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4742" /> }>
                                        <span>{ formatMessage({id: "LANG4738"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('bfcpstart', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true, message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkBFCPStart
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1024, 65535)
                                    }
                                }],
                                initialValue: bfcpstart
                            })(
                                <Input min={ 1024 } max={ 65535 } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4743" /> }>
                                        <span>{ formatMessage({id: "LANG4739"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('bfcpend', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true, message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkBFCPEnd
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1024, 65535)
                                    }
                                }],
                                initialValue: bfcpend
                            })(
                                <Input min={ 1024 } max={ 65535 } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4744" /> }>
                                        <span>{ formatMessage({id: "LANG4740"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('bfcp_tcp_start', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true, message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkBFCPTCPStart
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1024, 65535)
                                    }
                                }],
                                initialValue: bfcp_tcp_start
                            })(
                                <Input min={ 1024 } max={ 65535 } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4745" /> }>
                                        <span>{ formatMessage({id: "LANG4741"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('bfcp_tcp_end', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true, message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkBFCPTCPEnd
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1024, 65535)
                                    }
                                }],
                                initialValue: bfcp_tcp_end
                            })(
                                <Input min={ 1024 } max={ 65535 } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4438" /> }>
                                        <span>{ formatMessage({id: "LANG4406"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('turnaddr', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{ 
                                    validator: this._checkJBMax
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.host(data, value, callback, formatMessage, 'domain')
                                    }
                                }],
                                initialValue: turnaddr
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4439" /> }>
                                        <span>{ formatMessage({id: "LANG4407"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <input type="text" name="turnusername" className="hidden" />
                            { getFieldDecorator('turnusername', {
                                rules: [
                                    { validator: this._checkJBMax }
                                ],
                                initialValue: turnusername
                            })(
                                <Input maxLength={32} />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4440" /> }>
                                        <span>{ formatMessage({id: "LANG4408"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <input type="password" name="turnpassword" className="hidden" />
                            { getFieldDecorator('turnpassword', {
                                rules: [
                                    { validator: this._checkJBMax }
                                ],
                                initialValue: turnpassword
                            })(
                                <Input type="password" />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default injectIntl(RTP)
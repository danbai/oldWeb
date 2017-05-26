'use strict'

// import { bindActionCreators } from 'redux'
// import { connect } from 'react-redux'
// import * as Actions from './actions/getCTIMidSettings'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Form, Input, message, Tooltip } from 'antd'
import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

const FormItem = Form.Item

class CTIServer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ctimidSettings: {},
            openPort: ['22']
        }
    }
    componentWillMount() {}
    componentDidMount() {
        this._getOpenPort()
        this._getCTISettings()
    }
    _checkOpenPort = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.openPort, value) > -1) {
            callback(formatMessage({id: "LANG3869"}))
        } else {
            callback()
        }
    }
    _getOpenPort = () => {
        let openPort = this.state.openPort
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: { action: 'getNetstatInfo' },
            type: 'json',
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = data.response
                    const netstat = response.netstat
                    
                    netstat.map(function(item) {
                        if ($.inArray(item.port, openPort) > -1) {

                        } else {
                            openPort.push(item.port)
                        }
                    })
                }
            }.bind(this)
        })
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: { action: 'getSIPTCPSettings' },
            async: false,
            type: "json",
            error: function(jqXHR, textStatus, errorThrown) {
                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data)

                if (bool) {
                    let tlsbindaddr = data.response.sip_tcp_settings.tlsbindaddr
                    let tcpbindaddr = data.response.sip_tcp_settings.tcpbindaddr

                    if (tlsbindaddr) {
                        let tlsPort = tlsbindaddr.split(":")[1]

                        if (tlsPort && !($.inArray(tlsPort, openPort) > -1)) {
                            openPort.push(tlsPort)
                        }
                    }

                    if (tcpbindaddr) {
                        let tcpPort = tcpbindaddr.split(":")[1]

                        if (tcpPort && !($.inArray(tcpPort, openPort) > -1)) {
                            openPort.push(tcpPort)
                        }
                    }
                }
            }
        })

        this.setState({
            openPort: openPort
        })
    }
    _getCTISettings = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getCTIMidSettings' },
            type: 'json',
            async: true,
            success: function(res) {
                let ctimidSettings = res.response.ctimid_settings || {}
                let openPort = this.state.openPort
                openPort = _.without(openPort, ctimidSettings.port)
                this.setState({
                    ctimidSettings: ctimidSettings,
                    openPort: openPort
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        this.props.form.resetFields()
        this._getCTISettings()
        // browserHistory.push('/value-added-features/ctiServer')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = values

                action.action = 'updateCTIMidSettings'

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
                            message.success(formatMessage({ id: "LANG844" }))
                        }
                    }.bind(this)
                })
            }
        })
    }
    _validatePortFormate = (rule, value, callback) => {
        if (/^[0-9+]*x*.{0,1}$/i.test(value)) {
            callback()
        } else {
            callback('no match')
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

        let ctimidSettings = this.state.ctimidSettings || {}
        let port = ctimidSettings.port ? parseInt(ctimidSettings.port) : ''

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG4815"})})
        
        return (
            <div className="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG4815"}) } onSubmit={ this._handleSubmit } onCancel={ this._handleCancel } isDisplay='display-block' />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={formatMessage({id: "LANG4827"})}>
                                        <span>{formatMessage({id: "LANG1103"})}</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('port', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{ 
                                    required: true, message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1, 65535)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkOpenPort
                                }],
                                initialValue: port
                            })(
                                <Input min={ 1 } max={ 65535 } />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(CTIServer))

// const mapStateToProps = (state) => ({
//     ctimidSettings: state.ctiServer
// })

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators(Actions, dispatch)
// }

// export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(CTIServer)))
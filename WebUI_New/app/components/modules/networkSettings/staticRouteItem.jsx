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
import { Col, Form, Input, message, Modal, Transfer, Tooltip, Checkbox, Select, TimePicker } from 'antd'
import moment from "moment"

const FormItem = Form.Item
const Option = Select.Option
const addZero = UCMGUI.addZero

class StaticRouteItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            staticRoute: {
                route_netmask: "255.255.255.0",
                route_iface: "0"
            },
            staticRouteList: [],
            ifaceOptions: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }

    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }

    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const id = this.props.params.id
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        let staticRoute = this.state.staticRoute || {}
        let staticRouteList = this.state.staticRouteList || []
        let ifaceModeVal = ""
        let nethdlcEnable = "'"
        let ifaceOptions = this.state.ifaceOptions || []
        let item = {}

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getNetworkSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)
                if (bool) {
                    const response = res.response || {}
                    let netSettings = response.network_settings
                    ifaceModeVal = netSettings["method"]
                    nethdlcEnable = netSettings["hdlc0_enable"]
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (ifaceModeVal === "2") {
            item = {"key": "0", "name": formatMessage({id: "LANG3059"})}
            ifaceOptions.push(item)
            item = {"key": "1", "name": formatMessage({id: "LANG3060"})}
            ifaceOptions.push(item)
        } else if (ifaceModeVal === "0") {
            item = {"key": "0", "name": formatMessage({id: "LANG3057"})}
            ifaceOptions.push(item)
            item = {"key": "1", "name": formatMessage({id: "LANG3058"})}
            ifaceOptions.push(item)
        } else {
            item = {"key": "0", "name": formatMessage({id: "LANG3057"})}
            ifaceOptions.push(item)
        }

        if (model_info.num_pri > 0 && nethdlcEnable === "1") {
            item = {"key": "2", "name": formatMessage({id: "LANG3572"})}
            ifaceOptions.push(item)
        }

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listStaticRoutes',
                options: "route_index,route_dest,route_netmask,route_iface,route_gateway"
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)
                if (bool) {
                    const response = res.response || {}
                    staticRouteList = response.static_routes
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (id) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getStaticRoute',
                    route: id
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        staticRoute = response.route
                        if (response.route.route_enabled && response.route.route_enabled === 1) {
                            staticRoute["route_enabled"] = true
                        } else {
                            staticRoute["route_enabled"] = false
                        }
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }
        this.setState({
            staticRoute: staticRoute,
            staticRouteList: staticRouteList
        })
    }
    _handleCancel = () => {
        browserHistory.push('/system-settings/networkSettings/staticRoute')
    }
    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const { form } = this.props
        const id = this.props.params.id
        let staticRoute = this.state.staticRoute
        let values = form.getFieldsValue()

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>
        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                message.loading(loadingMessage)

                let action = values
                if (action["route_gateway"] === undefined) {
                    action["route_gateway"] = ""
                }

                if (id) {
                    action.action = 'updateStaticRoute'
                    action["route_enabled"] = values.route_enabled ? 1 : 0
                    action["route_index"] = id
                    action["old_dest"] = staticRoute.route_dest
                    action["old_netmask"] = staticRoute.route_netmask
                    action["old_gateway"] = staticRoute.route_gateway
                    action["old_iface"] = staticRoute.route_iface
                    action["old_active"] = staticRoute.route_active
                    action["old_enabled"] = staticRoute.route_enabled
                } else {
                    action.action = 'addStaticRoute'
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
                            this._handleCancel()
                        }
                    }.bind(this)
                })
            }
        })
    }
    _checkIsExist = (ele, val, callback) => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        let staticRouteList = this.state.staticRouteList
        let routeDestVal = getFieldValue('route_dest')
        let routeNetmaskVal = getFieldValue('route_netmask')
        let routeGatewayVal = getFieldValue('route_gateway')
        let routeIfaceVal = getFieldValue('route_iface')
        let res = true

        for (var i = 0; i < staticRouteList.length; i++) {
            let staticRoutesIndex = staticRouteList[i]
            if (staticRoutesIndex.route_dest === this.state.staticRoute.route_dest && staticRoutesIndex.route_iface === this.state.staticRoute.route_iface) {
                continue
            }
            if (staticRoutesIndex.route_dest === routeDestVal && staticRoutesIndex.route_iface === routeIfaceVal) {
                res = false
            }
        }
        if (!res) {
            callback(formatMessage({id: "LANG5044"}))
        } else {
            callback()
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const staticRoute = this.state.staticRoute

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
                    0: formatMessage({id: "LANG3047"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG3048"}))

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
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3189" /> }>
                                        <span>{ formatMessage({id: "LANG2772"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                            className={ this.props.params.id ? "display-block" : "hidden" }
                        >
                            { getFieldDecorator('route_enabled', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: staticRoute.route_enabled
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3050" /> }>
                                        <span>{ formatMessage({id: "LANG3049"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('route_dest', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.ipv4(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this._checkIsExist(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: staticRoute.route_dest
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3052" /> }>
                                        <span>{ formatMessage({id: "LANG3051"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('route_netmask', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.specialIpAddress(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: staticRoute.route_netmask
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3054" /> }>
                                        <span>{ formatMessage({id: "LANG3053"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('route_gateway', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.ipAddress(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: staticRoute.route_gateway
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG555" /> }>
                                        <span>{ formatMessage({id: "LANG555"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('route_iface', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: staticRoute.route_iface
                            })(
                                <Select>
                                    {
                                        this.state.ifaceOptions.map(function(value, index) {
                                            return <Option value={ value.key } key={ index }>{ value.name }</Option>
                                        })
                                    }
                                </Select>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(StaticRouteItem))
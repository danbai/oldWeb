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
import { Form, Input, message, Select, Tooltip, Checkbox, Row, Col, Transfer } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class CallBackItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            disaList: [],
            ivrList: [],
            displayIvrList: [],
            displayDisaList: [],
            displayDestinationList: [],
            callBackValues: {},
            destinationValues: {name: '', id: ''},
            callbackNameList: []
        }
    }
    componentWillMount() {
        this._getDisaList()
        this._getIvrList()
        this._getCallBack()
        this._getCallbackNameList()
    }
    componentDidMount() {
        this._handleDisplayDestination()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const name = this.props.params.name

        if (name && value && name === value) {
            callback()
        } else if (value && _.indexOf(this.state.callbackNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _getDisaList = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getDISAList' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let obj = {}
                    let response = res.response || {}
                    let disaList = response.disa || []

                    this.setState({
                        disaList: disaList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _getIvrList = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getIVRList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    let ivrList = response.ivr || []

                    this.setState({
                        ivrList: ivrList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _getCallBack = () => {
        const callBackIndex = this.props.params.id
        const callBackName = this.props.params.name

        if (callBackIndex && callBackName) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getCallback',
                    callback: callBackIndex
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}
                        let callBackValues = response.callback

                        this.setState({
                            callBackValues: callBackValues
                        })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }
    }
    _getCallbackNameList = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getCallbackNameList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    let callbackNameList = response.name || []

                    this.setState({
                        callbackNameList: callbackNameList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _handleDisplayDestination = () => {
        const callBackIndex = this.props.params.id
        const callBackName = this.props.params.name

        let displayIvrList = []
        let displayDisaList = []
        let displayDestinationList = []
        let destinationValues = {name: '', id: ''}

        let IvrList = this.state.ivrList
        let DisaList = this.state.disaList

        for (let i = 0; i < IvrList.length; i++) {
            let IvrName = IvrList[i]["ivr_name"]
            let ivrId = String(IvrList[i]["ivr_id"])
            if (IvrName && ivrId) {
                let obj = {
                    key: ivrId,
                    val: IvrName
                }
                displayIvrList.push(obj)
            }
        }
        for (let i = 0; i < DisaList.length; i++) {
            let disaName = DisaList[i]["display_name"]
            let disaId = String(DisaList[i]["disa_id"])
            if (disaName && disaId) {
                let obj = {
                    key: disaId,
                    val: disaName
                }
                displayDisaList.push(obj)
            }
        }

        if (callBackIndex && callBackName) {
            let callback = this.state.callBackValues
            if (callback.destination_type === 'ivr') {
                displayDestinationList = displayIvrList
                displayIvrList.map(function(item) {
                    if (item.key === callback.ivr) {
                        destinationValues['name'] = item.val
                        destinationValues['id'] = item.key
                    }
                })
            } else {
                displayDestinationList = displayDisaList
                displayDisaList.map(function(item) {
                    if (item.key === callback.disa) {
                        destinationValues['name'] = item.val
                        destinationValues['id'] = item.key
                    }
                })
            }
        } else {
            displayDestinationList = displayDisaList
            if (displayDisaList.length) {
                destinationValues['name'] = displayDisaList[0].val
                destinationValues['id'] = displayDisaList[0].key
            } else {
                destinationValues['name'] = ''
                destinationValues['id'] = ''
            }
        }

        this.setState({
            displayIvrList: displayIvrList,
            displayDisaList: displayDisaList,
            displayDestinationList: displayDestinationList,
            destinationValues: destinationValues
        })
        console.log('distination value is: ', destinationValues)
    }

    _handleCancel = () => {
        browserHistory.push('/call-features/callback')
    }

    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const callBackIndex = this.props.params.id
        const callBackName = this.props.params.name

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
                let destinationValues = this.state.destinationValues
                if (values.destination_type === 'disa') {
                    action.disa = destinationValues['id']
                } else if (values.destination_type === 'ivr') {
                    action.ivr = destinationValues['id']
                }
                delete action.external_number

                if (callBackIndex && callBackName) {
                    action.action = 'updateCallback'
                    action.callback = callBackIndex
                } else {
                    action.action = 'addCallback'
                }

                console.log('action: ', action)
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

    _onChangeMode = (e) => {
        let displayDestinationList = []
        let destinationValues = {name: '', id: ''}
        if (e === 'disa') {
            displayDestinationList = this.state.displayDisaList
        } else if (e === 'ivr') {
            displayDestinationList = this.state.displayIvrList
        } else {
            displayDestinationList = this.state.displayDisaList
        }

        if (displayDestinationList.length > 0) {
            destinationValues['name'] = displayDestinationList[0].val
            destinationValues['id'] = displayDestinationList[0].key
        } else {
            destinationValues['name'] = ''
            destinationValues['id'] = ''
        }
        this.setState({
            displayDestinationList: displayDestinationList,
            destinationValues: destinationValues
        })
    }

    _onChangeDestination = (e) => {
        console.log('destination is ', e)
        let destinationValues = {name: '', id: ''}
        let displayDestinationList = this.state.displayDestinationList
        displayDestinationList.map(function(item) {
            if (item.key === e) {
                destinationValues['name'] = item.val
                destinationValues['id'] = item.key
            }
        })
        this.setState({
            destinationValues: destinationValues
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const callBackValues = this.state.callBackValues
        const displayDestinationList = this.state.displayDestinationList
        const destinationValues = this.state.destinationValues

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemDestinationLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG3741"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG3743"}))

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
                            ref="div_name"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3744" />}>
                                    <span>{ formatMessage({id: "LANG135"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('name', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkName
                                }],
                                initialValue: callBackValues.name ? callBackValues.name : ''
                            })(
                                <Input placeholder={ formatMessage({id: "LANG135"}) } maxLength="32" />
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_callerid_pattern"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3823" />}>
                                    <span>{ formatMessage({id: "LANG2748"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('callerid_pattern', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digitalAndQuote(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: callBackValues.callerid_pattern ? callBackValues.callerid_pattern : ''
                            })(
                                <Input type='textarea' rows={5} placeholder={ formatMessage({id: "LANG2748"}) }/>
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_outside_pre"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3821" />}>
                                    <span>{ formatMessage({id: "LANG3824"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('outside_pre', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.phoneNumberOrExtension(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: callBackValues.outside_pre ? callBackValues.outside_pre : ''
                            })(
                                <Input placeholder={ formatMessage({id: "LANG3824"}) }/>
                            ) }
                        </FormItem>

                        <FormItem
                            ref="div_sleep_time"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3748" />}>
                                    <span>{ formatMessage({id: "LANG3747"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('sleep_time', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1, 60)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: callBackValues.sleep_time ? callBackValues.sleep_time : '5'
                            })(
                                <Input placeholder={ formatMessage({id: "LANG3747"}) } maxLength="2" />
                            ) }
                        </FormItem>

                        <Row>
                            <Col span={ 9 } style={{ marginRight: 20 }}>
                                <FormItem
                                    ref="div_destination_type"
                                    { ...formItemDestinationLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3749" />}>
                                            <span>{ formatMessage({id: "LANG168"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('destination_type', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        width: 100,
                                        initialValue: callBackValues.destination_type === "ivr" ? 'ivr' : 'disa'
                                    })(
                                        <Select onChange={ this._onChangeMode } >
                                            <Option value='disa'>{ formatMessage({id: "LANG2353"}) }</Option>
                                            <Option value='ivr'>{ formatMessage({id: "LANG19"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 6 } style={{ marginRight: 20 }}>
                                <FormItem>
                                    { getFieldDecorator('external_number', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: destinationValues['name']
                                    })(
                                         <Select onChange={ this._onChangeDestination }>
                                            {
                                                displayDestinationList.map(function(item) {
                                                    return <Option value={ item.key }>{ item.val }</Option>
                                                    }
                                                )
                                            }
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(CallBackItem))
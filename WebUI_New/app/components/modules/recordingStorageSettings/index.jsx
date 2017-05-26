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
import { Form, Input, message, Select, Tooltip, Checkbox, Radio, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

window.recordingStorageAutoRefresh = null

class RecordingStorageSettings extends Component {
    constructor(props) {
        super(props)

        this.state = {
            disabledStoreDevice: false,
            autoSelectDevice: 'yes',
            storeDeviceValue: 'local',
            displayUSD: true,
            displaySD: true,
            displayLocal: true
        }
    }
    componentWillMount() {
        this._getCheckDevice()
    }
    componentDidMount() {
        this._getInterfaceStatus()
        this._getRecordingLink()

        window.recordingStorageAutoRefresh = setInterval(this._autoRefresh, 8000)
    }
    componentWillUnmount() {
        clearInterval(window.recordingStorageAutoRefresh)
    }
    _autoRefresh = () => {
        this._getInterfaceStatus()
        this._getRecordingLink()
    }
    _getInterfaceStatus = () => {
        let enablesd = 'no'
        let enableusb = 'no'

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getInterfaceStatus'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    enablesd = res.response['interface-sdcard']
                    enableusb = res.response['interface-usbdisk']

                    if (enableusb === 'true') {
                        this.setState({
                            displayUSD: true
                        })
                    } else {
                        this.setState({
                            displayUSD: false
                        })
                    }
                    if (enablesd === 'true') {
                        this.setState({
                            displaySD: true
                        })
                    } else {
                        this.setState({
                            displaySD: false
                        })
                    }
                }
            }.bind(this),
            error: function(e) {
                // message.error(e.statusText)
            }
        })
    }
    _getCheckDevice = () => {
        let autoSelectDevice = 'yes'

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getCheckDevice'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    autoSelectDevice = response.auto_or_no
                    if (autoSelectDevice === 'no') {
                        this.setState({
                            autoSelectDevice: autoSelectDevice,
                            disabledStoreDevice: false
                        })
                    } else {
                        this.setState({
                            disabledStoreDevice: true
                        })
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getRecordingLink = () => {
        let recordLink = 'local'

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getRecordingLink'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    recordLink = response.body
                    if (recordLink === 'USB') {
                        this.setState({
                            storeDeviceValue: 'usb'
                        })
                    } else if (recordLink === 'SD') {
                        this.setState({
                            storeDeviceValue: 'sd'
                        })
                    } else {
                        this.setState({
                            storeDeviceValue: 'local'
                        })
                    }
                }
            }.bind(this),
            error: function(e) {
                // message.error(e.statusText)
            }
        })
    }
    _CopyLocalRecordFiles = () => {
        let deviceIndex = '0'
        const device = this.state.storeDeviceValue
        if (device === 'usb') {
            deviceIndex = '5'
        } else if (device === 'sd') {
            deviceIndex = '2'
        } else if (device === 'local') {
            deviceIndex = '0'
        }
        if (deviceIndex !== '0') {
            browserHistory.push('/pbx-settings/recordingStorageSettings/' + deviceIndex)
        }
    }
    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        let auto_device = this.state.autoSelectDevice
        let store_device = this.state.storeDeviceValue
        const __this = this

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2915" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: {
                            "action": "setCheckDevice",
                            "auto_or_no": auto_device
                        },
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            if (auto_device !== 'no') {
                                $.ajax({
                                    url: api.apiHost,
                                    method: "post",
                                    data: {
                                            "action": "setCheckDeviceAuto",
                                            "auto_or_no": "yes"
                                        },
                                    type: 'json',
                                    error: function(e) {
                                        message.error(e.statusText)
                                    },
                                    success: function(data) {
                                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                        if (bool) {
                                            message.destroy()
                                            let mgs = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG844" })}}></span>
                                            message.success(mgs)
                                        }
                                    }.bind(this)
                                })
                            }
                        }
                    }.bind(this)
                })

                let chooseLink = 0
                if (store_device === 'local') {
                    chooseLink = 0
                } else if (store_device === 'sd') {
                    chooseLink = 2
                } else if (store_device === 'usb') {
                    chooseLink = 5
                }
                if (auto_device === 'no') {
                    $.ajax({
                        url: api.apiHost,
                        method: "post",
                        data: {
                                "action": "ChooseLink",
                                "choose_link": chooseLink
                            },
                        type: 'json',
                        error: function(e) {
                            message.error(e.statusText)
                        },
                        success: function(data) {
                            const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                if (chooseLink === 0) {
                                    message.success(successMessage)
                                } else if (chooseLink === 2 || chooseLink === 5) {
                                    let cp_to = (chooseLink === 5) ? "USB" : "SD"

                                    confirm({
                                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG3854"}, {0: cp_to, 1: cp_to})}} ></span>,
                                        onOk() {
                                            __this._CopyLocalRecordFiles()
                                        },
                                        onCancel() {}
                                    })
                                }
                            }
                        }.bind(this)
                    })
                }
            }
        })
    }
    _onChangeAutoSelectDevice = (e) => {
        if (e.target.checked) {
            console.log('setting disabledStoreDevice is true')
            this.setState({
              disabledStoreDevice: true,
              autoSelectDevice: 'yes'
            })
        } else {
            console.log('setting disabledStoreDevice is false')
            this.setState({
              disabledStoreDevice: false,
              autoSelectDevice: 'no'
            })
        }
    }
    _onChanStoreDevice = (e) => {
        console.log('change store device: ', e.target.value)

        this.setState({
          storeDeviceValue: e.target.value
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const radioStyle = {
          display: 'block',
          height: '30px',
          lineHeight: '30px'
        }

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG3378"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG3378"}))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onSubmit={ this._handleSubmit }
                    isDisplay='display-block'
                    isDisplayCancel="hidden"
                />
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_auto_device"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG3987" />}>
                                    <span>{formatMessage({id: "LANG3986"})}</span>
                                </Tooltip>
                            }>
                            <Checkbox
                                onChange={ this._onChangeAutoSelectDevice }
                                checked={ this.state.autoSelectDevice === 'yes' }
                            />
                        </FormItem>

                        <FormItem
                            { ...formItemLayout }
                            className= { this.state.displayUSD ? 'display-block' : 'hidden' }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2916" />}>
                                <span>{ formatMessage({id: "LANG263"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Radio
                                value="usb"
                                style={radioStyle}
                                onChange={this._onChanStoreDevice}
                                disabled={ this.state.disabledStoreDevice }
                                checked={ this.state.storeDeviceValue === 'usb' }
                            ></Radio>
                        </FormItem>

                        <FormItem
                            { ...formItemLayout }
                            className= { this.state.displaySD ? 'display-block' : 'hidden' }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2920" />}>
                                <span>{ formatMessage({id: "LANG262"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Radio
                                value="sd"
                                style={radioStyle}
                                onChange={ this._onChanStoreDevice }
                                disabled={ this.state.disabledStoreDevice }
                                checked={ this.state.storeDeviceValue === 'sd' }
                            ></Radio>
                        </FormItem>

                        <FormItem
                            { ...formItemLayout }
                            className= { this.state.displayLocal ? 'display-block' : 'hidden' }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2915" />}>
                                <span>{ formatMessage({id: "LANG1072"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Radio
                                value='local'
                                style={ radioStyle }
                                onChange={ this._onChanStoreDevice }
                                disabled={ this.state.disabledStoreDevice }
                                checked={ this.state.storeDeviceValue === 'local' }
                            ></Radio>
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(RecordingStorageSettings))
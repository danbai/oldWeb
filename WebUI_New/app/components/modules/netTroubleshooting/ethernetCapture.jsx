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
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip, Button, Radio } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
let SFTPPort

class EnternetCapture extends Component {
    constructor(props) {
        super(props)
        const { formatMessage } = this.props.intl
        this.state = {
            useSftpDisable: false,
            useSDDisable: false,
            bNethdlcEnable: false,
            startDisable: false,
            stopDisable: true,
            downloadDisable: true,
            deviceRadio: [],
            useSftpEnable: false,
            useSDEnable: false,
            shooting: {}
        }
    }
    componentDidMount = () => {
        this._processNetHDLCInterface()
        this._checkDevice()
        this._getTroubleShooting()
        this._getSFTPPort()
    }
    _getTroubleShooting = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getTroubleShooting',
                'shooting-state': ''
            },
            async: false,
            error: function(e) {
                this._buttonSwitch(false)
                message.error(e.statusText)
            }.bind(this),
            success: function(val) {
                if (typeof val === "object") {
                    var shooting = val.response.body,
                        useSD = shooting.useSD,
                        capture = shooting.capture,
                        valFilter = capture ? capture.param : ''

                    if (shooting) {
                        this.setState({
                            shooting: shooting
                        })
                    }

                    if (useSD) {
                        this.setState({
                            useSftpDisable: true,
                            useSDDisable: false,
                            useSDEnable: true,
                            useSftpEnable: false
                        })
                    } else if (valFilter.indexOf('port !' + SFTPPort) > -1) {
                        this.setState({
                            useSftpDisable: false,
                            useSftpEnable: true
                        })
                    }

                    if (capture) {
                        this.setState({
                            msg: formatMessage({id: "LANG1582"}) 
                        })

                        this._buttonSwitch(true)

                        return
                    }
                }

                this._buttonSwitch(false)
            }.bind(this)
        })
    }
    _getSFTPPort = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getDisabledPortList'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var port = data.response.Psftp_port

                SFTPPort = (port ? port : '22')
            }.bind(this)
        })
    }
    _checkDevice = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getInterfaceStatus',
                'auto-refresh': Math.random()
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var sdcard_info = data.response['interface-sdcard'],
                    usbdisk_info = data.response['interface-usbdisk'],
                    deviceRadio = []

                if (usbdisk_info === "true") {
                    deviceRadio.push({
                        val: 'usb',
                        text: formatMessage({id: "LANG263"})
                    })
                }

                if (sdcard_info === "true") {
                    deviceRadio.push({
                        val: 'sd',
                        text: formatMessage({id: "LANG262"})
                    })
                }

                this.setState({
                    deviceRadio: deviceRadio
                })
            }.bind(this)
        })
    }
    _processNetHDLCInterface = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getNetworkSettings'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var nethdlcEnable = data.response.network_settings.hdlc0_enable

                if (nethdlcEnable === '0') {
                    this.setState({
                        bNethdlcEnable: true
                    })
                }
            }.bind(this)
        })
    }
    _buttonSwitch = (start) => {
        this.setState({
            startDisable: start,
            stopDisable: !start
        })

        if (start) {
            this.setState({
                captureDisable: true,
                captureFilterDisable: true,
                useSftpDisable: true,
                useSDDisable: true
            })
        } else {
            this.setState({
                captureDisable: false,
                captureFilterDisable: false,
                useSftpDisable: false
            })

            if (this.state.useSftpEnable) {
                this.setState({
                    useSftpDisable: false,
                    useSDDisable: true,
                    useSDEnable: false
                })
            } else if (this.state.useSDEnable) {
                this.setState({
                    useSftpDisable: true,
                    useSDDisable: false,
                    useSDEnable: true
                })
            } else {
                this.setState({
                    useSftpDisable: false,
                    useSDDisable: false,
                    useSDEnable: false
                })
            }
        }

        this._btnDownloadCcheckState()
    }
    _btnDownloadCcheckState = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'checkFile',
                'type': 'troubleshooting'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                if (data !== undefined && data.status !== undefined && data.status === 0 && data.response.result === 0) {
                    this.setState({
                        downloadDisable: false,
                        msg: formatMessage({id: "LANG1581"})
                    })
                } else {
                    this.setState({
                        downloadDisable: true
                    })
                }
            }.bind(this)
        })
    }
    _valOrDefault = (val, def) => {
        return (val === undefined || val === null) ? def : val
    }
    _dataBind = (val) => {
        const { formatMessage } = this.props.intl

        var done = false,
            output, locale

        val = val.response.body

        this._buttonSwitch(true)

        if (typeof val === "object") {
            if (val.capture) {
                output = this._valOrDefault(val.capture.content)
                done = this._valOrDefault(val.capture.finish, false)
            }
        } else {
            output = val
        }

        if (done) {
            this._buttonSwitch(false)

            locale = "LANG1581"

            if (this.state.useSftpEnable) {
                locale = "LANG2330"
            } else if (this.state.useSDEnable) {
                locale = "LANG1365"
            }
        } else {
            locale = "LANG1582"
        }

        this.setState({
            msg: formatMessage({id: locale})
        })
    }
    _start = () => {
        let loadingMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                let data = {
                    'capture': values.capture,
                    'action': 'startTroubleShooting',
                    'useSftp': values.useSftp ? 'yes' : 'no'
                }

                let filter = values['capture-filter'] || '',
                    device = values.device

                if (values.useSD) {
                    if (this.state.deviceRadio.length === 0) {
                        message.warning(formatMessage({id: 'LANG5090'}, {0: formatMessage({id: 'LANG5088'})}))
                        return false
                    } else if (values.device === undefined) {
                        message.warning(formatMessage({id: 'LANG5089'}, {0: formatMessage({id: 'LANG5088'})}))
                        return false
                    } else {
                        data.useSD = device
                    }
                }

                message.loading(loadingMessage, 0)

                if (values.useSftp) {
                    data['capture-filter'] = filter ? (filter + ' && port !' + SFTPPort) : ('port !' + SFTPPort)
                } else {
                    data['capture-filter'] = filter
                }

                this.setState({
                    startDisable: true,
                    stopDisable: false,
                    downloadDisable: true
                })

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: data,
                    type: 'json',
                    error: function(e) {
                        var msg = ""

                        msg += this._valOrDefault(e.response.body, "UNKNOWN ERROR") + "<br/>"
                        msg += this._valOrDefault(e.response.detail, "")

                        this.setState({
                            msg: msg
                        })

                        message.error(e.statusText)
                    }.bind(this),
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            this._dataBind(data)
                        } else {
                            this._buttonSwitch(false)
                            this.setState({
                                msg: data.response.body
                            })
                        }
                    }.bind(this)
                })
            }
        })
    }
    _stop = () => {
        const { formatMessage } = this.props.intl
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3247" })}}></span>

        this.setState({
            stopDisable: true
        })

        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'stopTroubleShooting',
                capture: ''
            },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            }.bind(this),
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    this._dataBind(data)
                }
            }.bind(this)
        })
    }
    _download = () => {
        window.open(api.apiHost + "action=downloadFile&type=troubleshooting", '_self')
    }
    _useSftpChange = (e) => {
        this.setState({
            useSftpEnable: e.target.checked,
            useSDDisable: e.target.checked
        })
    }
    _useSDChange = (e) => {
        this.setState({
            useSftpDisable: e.target.checked,
            useSDEnable: e.target.checked
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }
        const formItemLayoutOffset = {
            wrapperCol: { span: 12, offset: 6 }
        }
        let deviceRadio = this.state.deviceRadio
        let captureList = [
            {
                val: 'WAN',
                text: formatMessage({id: "LANG264"})
            }, {
                val: 'LAN',
                text: formatMessage({id: "LANG265"})
            }, {
                val: 'LAN 1',
                text: formatMessage({id: "LANG266"})
            }, {
                val: 'LAN 2',
                text: formatMessage({id: "LANG267"})
            }, {
                val: 'LOCAL',
                text: formatMessage({id: "LANG268"})
            }, {
                val: 'NetHDLC 1',
                text: formatMessage({id: "LANG3572"})
            }
        ]

        if (model_info.model_name !== 'UCM6510' || this.state.bNethdlcEnable) {
            captureList.pop()
        }

        if (model_info.net_mode === '0') {
            captureList.splice(2, 2)
        } else if (model_info.net_mode === '2') {
            captureList.splice(0, 2)
        } else {
            captureList.splice(2, 2)
            captureList.splice(0, 1)
        }

        if (model_info.enable_openvpn === '1') {
            captureList.push({
                val: 'VPN',
                text: 'VPN'
            })
        }

        if (model_info.enable_webrtc_openvpn === '1') {
            captureList.push({
                val: 'WebRTC VPN',
                text: 'WebRTC VPN'
            })
        }

        let shooting = this.state.shooting,
            capture = shooting.capture,
            useSD = shooting.useSD

        return (
            <div className="content">
                <Form>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1578" /> }>
                                        <span>{ formatMessage({id: "LANG1577"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('capture', {
                                    initialValue: capture ? capture.interface : captureList[0].val
                                })(
                                    <Select disabled={ this.state.captureDisable }>
                                        {
                                            captureList.map(function(item, key) {
                                                return <Option value={ item.val } key={ key }>{ item.text }</Option>
                                            })
                                        }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1650" /> }>
                                            <span>{ formatMessage({id: "LANG1644"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('useSftp', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.useSftpEnable
                                })(
                                    <Checkbox disabled={ this.state.useSftpDisable } onChange={ this._useSftpChange } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2830" /> }>
                                            <span>{ formatMessage({id: "LANG2830"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('useSD', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.useSDEnable
                                })(
                                    <Checkbox disabled={ this.state.useSDDisable } onChange={ this._useSDChange } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1580" /> }>
                                            <span>{ formatMessage({id: "LANG1579"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('capture-filter', {
                                    initialValue: capture ? capture.param : ''
                                })(
                                    <Input disabled={ this.state.captureFilterDisable } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayoutOffset }
                            >
                                { getFieldDecorator('device', {
                                    initialValue: useSD
                                })(
                                    <RadioGroup disabled={ !this.state.useSDEnable }>
                                        {
                                            deviceRadio.map(function(item, key) {
                                                return <Radio value={ item.val } key={ key }>{ item.text }</Radio>
                                            })
                                        }
                                    </RadioGroup>
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <div className="top-button">
                        <Button
                            type="primary"
                            size="default"
                            disabled={ this.state.startDisable }
                            onClick={ this._start }
                        >
                            { formatMessage({id: "LANG724"}) }
                        </Button>
                        <Button
                            type="primary"
                            size="default"
                            disabled={ this.state.stopDisable }
                            onClick={ this._stop }
                        >
                            { formatMessage({id: "LANG725"}) }
                        </Button>
                        <Button
                            type="primary"
                            size="default"
                            disabled={ this.state.downloadDisable }
                            onClick={ this._download }
                        >
                            { formatMessage({id: "LANG759"}) }
                        </Button>
                    </div>
                    <div className="lite-desc">
                        { formatMessage({id: "LANG666"}) }
                    </div>
                    <div>{ this.state.msg }</div>
                </Form>
            </div>
        )
    }
}

export default Form.create()(injectIntl(EnternetCapture))
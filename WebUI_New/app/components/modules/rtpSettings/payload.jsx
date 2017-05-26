'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Form, Input, Button, Checkbox, message, Row, Col, Tooltip } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import _ from 'underscore'
import Validator from "../../api/validator"

const FormItem = Form.Item

class Payload extends Component {
    constructor(props) {
        super(props)
        this.state = {
            payloadSettings: {},
            initPayloadSettings: {},
            defaultPayload: {
                ast_format_g726_aal2: '112',
                ast_rtp_dtmf: '101',
                option_g726_compatible_g721: 'yes',
                ast_format_ilbc: '97',
                ast_format_opus: '123',
                ast_format_h264: '99',
                ast_format_vp8: '108',
                ast_format_main_video_fec: '120',
                ast_format_fecc: '125',
                ast_format_slides_video_fec: '120',
                ast_format_audio_fec: '120',
                ast_format_h263_plus: '100,103',
                ast_format_g726: '2'
            },
            visiable726: true,
            disable726: true
        }
    }
    componentDidMount() {
        // this._getPayloadSettings()
        const payloadSettings = this.props.payloadSettings
        const initPayloadSettings = this.props.initPayloadSettings
        const disable726 = this.props.disable726
        this.setState({
            payloadSettings: payloadSettings,
            initPayloadSettings: initPayloadSettings,
            disable726: disable726
        })
    }
    _getPayloadSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getPayloadSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                let response = res.response || {}

                this.setState({
                    payloadSettings: response.payload_settings[0] || {},
                    initPayloadSettings: response.payload_settings[0] || {},
                    disable726: response.payload_settings[0].option_g726_compatible_g721 === 'yes'
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onChangeOption = (e) => {
        const { setFieldsValue } = this.props.form
        if (e.target.checked) {
            setFieldsValue({
                ast_format_g726: '2'
            })
            this.setState({
                disable726: true
            })
        } else {
            setFieldsValue({
                ast_format_g726: '111'
            })
            this.setState({
                disable726: false
            })
        }
    }
    _resetAudio = () => {
        const { setFieldsValue } = this.props.form
        const initPayloadSettings = this.state.initPayloadSettings
        setFieldsValue({
            ast_format_g726_aal2: initPayloadSettings.ast_format_g726_aal2,
            ast_rtp_dtmf: initPayloadSettings.ast_rtp_dtmf,
            option_g726_compatible_g721: initPayloadSettings.option_g726_compatible_g721 === 'yes',
            ast_format_g726: initPayloadSettings.ast_format_g726,
            ast_format_ilbc: initPayloadSettings.ast_format_ilbc,
            ast_format_opus: initPayloadSettings.ast_format_opus
        })
        this.setState({
            disable726: initPayloadSettings.option_g726_compatible_g721 === 'yes'
        })
    }
    _resetDefaultAudio = () => {
        const { setFieldsValue } = this.props.form
        const defaultPayload = this.state.defaultPayload
        setFieldsValue({
            ast_format_g726_aal2: defaultPayload.ast_format_g726_aal2,
            ast_rtp_dtmf: defaultPayload.ast_rtp_dtmf,
            option_g726_compatible_g721: defaultPayload.option_g726_compatible_g721 === 'yes',
            ast_format_g726: defaultPayload.ast_format_g726,
            ast_format_ilbc: defaultPayload.ast_format_ilbc,
            ast_format_opus: defaultPayload.ast_format_opus
        })
        this.setState({
            disable726: true
        })
    }
    _resetVideo = () => {
        const { setFieldsValue } = this.props.form
        const initPayloadSettings = this.state.initPayloadSettings
        setFieldsValue({
            ast_format_h264: initPayloadSettings.ast_format_h264,
            h263p_1: initPayloadSettings.ast_format_h263_plus.split(',')[0],
            h263p_2: initPayloadSettings.ast_format_h263_plus.split(',')[1],
            ast_format_vp8: initPayloadSettings.ast_format_vp8
        })
    }
    _resetDefaultVideo = () => {
        const { setFieldsValue } = this.props.form
        const defaultPayload = this.state.defaultPayload
        setFieldsValue({
            ast_format_h264: defaultPayload.ast_format_h264,
            h263p_1: defaultPayload.ast_format_h263_plus.split(',')[0],
            h263p_2: defaultPayload.ast_format_h263_plus.split(',')[1],
            ast_format_vp8: defaultPayload.ast_format_vp8
        })
    }
    _resetFEC = () => {
        const { setFieldsValue } = this.props.form
        const initPayloadSettings = this.state.initPayloadSettings
        setFieldsValue({
            ast_format_main_video_fec: initPayloadSettings.ast_format_main_video_fec,
            ast_format_slides_video_fec: initPayloadSettings.ast_format_slides_video_fec,
            ast_format_audio_fec: initPayloadSettings.ast_format_audio_fec
        })
    }
    _resetDefaultFEC = () => {
        const { setFieldsValue } = this.props.form
        const defaultPayload = this.state.defaultPayload
        setFieldsValue({
            ast_format_main_video_fec: defaultPayload.ast_format_main_video_fec,
            ast_format_slides_video_fec: defaultPayload.ast_format_slides_video_fec,
            ast_format_audio_fec: defaultPayload.ast_format_audio_fec
        })
    }
    _resetFECC = () => {
        const { setFieldsValue } = this.props.form
        const initPayloadSettings = this.state.initPayloadSettings
        setFieldsValue({
            ast_format_fecc: initPayloadSettings.ast_format_fecc
        })
    }
    _resetDefaultFECC = () => {
        const { setFieldsValue } = this.props.form
        const defaultPayload = this.state.defaultPayload
        setFieldsValue({
            ast_format_fecc: defaultPayload.ast_format_fecc
        })
    }
    _checkPayloadExists = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldsValue } = this.props.form

        let payloadObj = getFieldsValue(['ast_format_g726_aal2',
                'ast_rtp_dtmf',
                'ast_format_ilbc',
                'ast_format_opus',
                'ast_format_h264',
                'ast_format_vp8',
                'ast_format_main_video_fec',
                'ast_format_fecc',
                'h263p_2',
                'h263p_1',
                'ast_format_g726'])
        let payload_list = []
        for (let item in payloadObj) {
            if (item !== rule.field) {
                payload_list.push(parseInt(payloadObj[item]))
            }
        }

        if (value && _.indexOf(payload_list, parseInt(value)) > -1) {
            callback(formatMessage({id: "LANG2728"}))
        } else {
            callback()
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        const payloadSettings = this.state.payloadSettings

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG2899"})})

        return (
            <div className="app-content-main">
                <div className="content">
                    <Form>
                        <div className='section-title'>
                            { formatMessage({id: 'LANG2900'}) }
                        </div>
                        <Row className="row-section-content">
                            <div className='top-button'>
                                <Button onClick={ this._resetAudio }>
                                    { formatMessage({id: 'LANG751'}) }
                                </Button>
                                <Button onClick={ this._resetDefaultAudio }>
                                    { formatMessage({id: 'LANG749'}) }
                                </Button>
                            </div>
                            <Row>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2717" />}>
                                                <span>{formatMessage({id: "LANG2716"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_g726_aal2', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this._checkPayloadExists
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.range(data, value, callback, formatMessage, 96, 127)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: payloadSettings.ast_format_g726_aal2
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2719" />}>
                                                <span>{formatMessage({id: "LANG2718"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_rtp_dtmf', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this._checkPayloadExists
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.range(data, value, callback, formatMessage, 96, 127)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: payloadSettings.ast_rtp_dtmf
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2781" />}>
                                                <span>{formatMessage({id: "LANG2781"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('option_g726_compatible_g721', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: payloadSettings.option_g726_compatible_g721 === 'yes'
                                        })(
                                            <Checkbox onChange={ this._onChangeOption }/>
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2721" />}>
                                                <span>{formatMessage({id: "LANG2720"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_g726', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this._checkPayloadExists
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.disable726 ? callback() : Validator.range(data, value, callback, formatMessage, 96, 127)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: payloadSettings.ast_format_g726
                                        })(
                                            <Input min={ 96 } max={ 127 } disabled={ this.state.disable726 }/>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2723" />}>
                                                <span>{formatMessage({id: "LANG2722"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_ilbc', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this._checkPayloadExists
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.range(data, value, callback, formatMessage, 96, 127)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: payloadSettings.ast_format_ilbc
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG5243" />}>
                                                <span>{formatMessage({id: "LANG5242"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_opus', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this._checkPayloadExists
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.range(data, value, callback, formatMessage, 96, 127)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: payloadSettings.ast_format_opus
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Row>
                        </Row>
                        <div className='section-title'>
                            { formatMessage({id: 'LANG2715'}) }
                        </div>
                        <Row className="row-section-content">
                            <div className='top-button'>
                                <Button onClick={ this._resetVideo }>
                                    { formatMessage({id: 'LANG751'}) }
                                </Button>
                                <Button onClick={ this._resetDefaultVideo }>
                                    { formatMessage({id: 'LANG749'}) }
                                </Button>
                            </div>
                            <Row>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2725" />}>
                                                <span>{formatMessage({id: "LANG2724"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_h264', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this._checkPayloadExists
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.range(data, value, callback, formatMessage, 96, 127)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: payloadSettings.ast_format_h264
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2727" />}>
                                                <span>{formatMessage({id: "LANG2726"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        <Col span={ 10 }>
                                            <FormItem>
                                            { getFieldDecorator('h263p_1', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: this._checkPayloadExists
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.range(data, value, callback, formatMessage, 96, 127)
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.digits(data, value, callback, formatMessage)
                                                    }
                                                }],
                                                initialValue: payloadSettings.ast_format_h263_plus && payloadSettings.ast_format_h263_plus.split(',')[0]
                                            })(
                                                <Input min={ 96 } max={ 127 } />
                                            ) }
                                            </FormItem>
                                        </Col>
                                        <Col span={ 10 } offset={4}>
                                            <FormItem>
                                            { getFieldDecorator('h263p_2', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: true,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: this._checkPayloadExists
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.range(data, value, callback, formatMessage, 96, 127)
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.digits(data, value, callback, formatMessage)
                                                    }
                                                }],
                                                initialValue: payloadSettings.ast_format_h263_plus && payloadSettings.ast_format_h263_plus.split(',')[1]
                                            })(
                                                <Input min={ 96 } max={ 127 } />
                                            ) }
                                            </FormItem>
                                        </Col>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={ 12 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4449" />}>
                                                <span>{formatMessage({id: "LANG4448"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_vp8', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this._checkPayloadExists
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.range(data, value, callback, formatMessage, 96, 127)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: payloadSettings.ast_format_vp8
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Row>
                        </Row>
                        <div className='section-title'>
                            { formatMessage({id: 'LANG4176'}) }
                        </div>
                        <Row className="row-section-content">
                            <div className='top-button'>
                                <Button onClick={ this._resetFEC }>
                                    { formatMessage({id: 'LANG751'}) }
                                </Button>
                                <Button onClick={ this._resetDefaultFEC }>
                                    { formatMessage({id: 'LANG749'}) }
                                </Button>
                            </div>
                            <Row>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4168" />}>
                                                <span>{formatMessage({id: "LANG4167"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_main_video_fec', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this._checkPayloadExists
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.range(data, value, callback, formatMessage, 96, 127)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: payloadSettings.ast_format_main_video_fec
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={12} className='hidden'>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4173" />}>
                                                <span>{formatMessage({id: "LANG4177"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_slides_video_fec', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }],
                                            initialValue: payloadSettings.ast_format_slides_video_fec
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12} className='hidden'>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4175" />}>
                                                <span>{formatMessage({id: "LANG4174"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_audio_fec', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }],
                                            initialValue: payloadSettings.ast_format_audio_fec
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Row>
                            <div className='section-title' className='hidden'>
                                { formatMessage({id: 'LANG4204'}) }
                            </div>
                            <div className='top-button' className='hidden'>
                                <Button onClick={ this._resetFEC }>
                                    { formatMessage({id: 'LANG751'}) }
                                </Button>
                                <Button onClick={ this._resetDefaultFEC }>
                                    { formatMessage({id: 'LANG749'}) }
                                </Button>
                            </div>
                            <Row className='hidden'>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4205" />}>
                                                <span>{formatMessage({id: "LANG4205"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_main_video_red', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }],
                                            initialValue: '122'
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4173" />}>
                                                <span>{formatMessage({id: "LANG4177"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_slides_video_red', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }],
                                            initialValue: '122'
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row className='hidden'>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4175" />}>
                                                <span>{formatMessage({id: "LANG4174"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_audio_red', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }],
                                            initialValue: '122'
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Row>
                        </Row>
                        <div className='section-title'>
                            { formatMessage({id: 'LANG4211'}) }
                        </div>
                        <Row className="row-section-content">
                            <div className='top-button'>
                                <Button onClick={ this._resetFECC }>
                                    { formatMessage({id: 'LANG751'}) }
                                </Button>
                                <Button onClick={ this._resetDefaultFECC }>
                                    { formatMessage({id: 'LANG749'}) }
                                </Button>
                            </div>
                            <Row>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4213" />}>
                                                <span>{formatMessage({id: "LANG4212"})}</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('ast_format_fecc', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: this._checkPayloadExists
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.range(data, value, callback, formatMessage, 96, 127)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: payloadSettings.ast_format_fecc
                                        })(
                                            <Input min={ 96 } max={ 127 } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Row>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

export default injectIntl(Payload)
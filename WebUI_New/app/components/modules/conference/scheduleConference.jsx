'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Select, Tooltip, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class ScheduleConference extends Component {
    constructor(props) {
        super(props)

        let meetList = this.props.meetList || {}

        this.state = {
            waitAdminEnable: meetList.wait_admin ? (meetList.wait_admin === 'yes') : false,
            quiteModeEnable: meetList.quiet_mode ? (meetList.quiet_mode === 'yes') : false,
            announceCallers: meetList.announce_callers ? (meetList.announce_callers === 'yes') : false,
            userInviteEnable: meetList.user_invite ? (meetList.user_invite === 'yes') : false,
            musicclassHidden: meetList.moh_firstcaller === 'yes',
            mohNameList: [],
            conferenceRange: [],
            existNumberList: []
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _getInitData = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getMohNameList'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var list = data.response.moh_name

                if (list && list.length > 0) {
                    this.setState({
                        mohNameList: list
                    })
                }
            }.bind(this)
        })

        this.setState({
            conferenceRange: UCMGUI.isExist.getRange('conference'),
            existNumberList: UCMGUI.isExist.getList("getNumberList")
        })
    }
    _handleWaitAdminChange = (e) => {
        this.setState({
            waitAdminEnable: e.target.checked
        })
    }
    _handleQuiteModeChange = (e) => {
        this.setState({
            quiteModeEnable: e.target.checked
        })
    }
    _handleAnnounceChange = (e) => {
        this.setState({
            announceCallers: e.target.checked
        })
    }
    _handleMusicclassChange = (e) => {
        this.setState({
            musicclassHidden: e.target.checked
        })
    }
    _handleUserInviteChange = (e) => {
        const {formatMessage} = this.props.intl,
            self = this

        this.setState({
            userInviteEnable: e.target.checked
        })

        if (this.props.publicEnable && e.target.checked) {
            Modal.confirm({
                content: formatMessage({id: "LANG2433"}, {
                        0: formatMessage({id: "LANG1027"}),
                        1: formatMessage({id: "LANG2431"})
                    }),
                okText: formatMessage({id: "LANG727" }),
                cancelText: formatMessage({id: "LANG726" }),
                onOk() {
                    self.props.form.setFieldsValue({
                        user_invite: true
                    })

                    self.setState({
                        userInviteEnable: true
                    })
                },
                onCancel() {
                    self.props.form.setFieldsValue({
                        user_invite: false
                    })

                    self.setState({
                        userInviteEnable: false
                    })
                }
            })
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        const meetList = this.props.meetList || {}
        const form = this.props.form

        return (
            <div className="content">
                <div className="ant-form">
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2432" /> }>
                                        <span>{ formatMessage({id: "LANG2431"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('public', {
                                    valuePropName: 'checked',
                                    initialValue: this.props.publicEnable
                                })(
                                    <Checkbox disabled={ this.state.waitAdminEnable } onChange={ this.props.handlePublicChange } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1037" /> }>
                                            <span>{ formatMessage({id: "LANG1041"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('wait_admin', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.waitAdminEnable
                                })(
                                    <Checkbox disabled={ this.props.publicEnable } onChange={ this._handleWaitAdminChange } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1033" /> }>
                                        <span>{ formatMessage({id: "LANG1032"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('pincode', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            !this.props.publicEnable ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            !this.props.publicEnable ? Validator.minlength(data, value, callback, formatMessage, 4) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let val = form.getFieldValue('admin_pincode')
                                            !this.props.publicEnable ? Validator.notEqualTo(data, value, callback, formatMessage, val, formatMessage({id: "LANG1020"})) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            !this.props.publicEnable ? Validator.checkNumericPw(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: meetList.pincode
                                })(
                                    <Input disabled={ this.props.publicEnable } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1021" /> }>
                                            <span>{ formatMessage({id: "LANG1020"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('admin_pincode', {
                                    rules: [
                                        {
                                            required: !this.props.publicEnable,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                !this.props.publicEnable ? Validator.digits(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                !this.props.publicEnable ? Validator.minlength(data, value, callback, formatMessage, 4) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                let val = form.getFieldValue('pincode')
                                                !this.props.publicEnable ? Validator.notEqualTo(data, value, callback, formatMessage, val, formatMessage({id: "LANG1032"})) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                !this.props.publicEnable ? Validator.checkNumericPw(data, value, callback, formatMessage) : callback()
                                            }
                                        }],
                                    initialValue: meetList.admin_pincode
                                })(
                                    <Input disabled={ this.props.publicEnable } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1037" /> }>
                                        <span>{ formatMessage({id: "LANG1036"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('quiet_mode', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.quiteModeEnable
                                })(
                                    <Checkbox disabled={ this.state.announceCallers } onChange={ this._handleQuiteModeChange } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1023" /> }>
                                        <span>{ formatMessage({id: "LANG1022"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('announce_callers', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.announceCallers
                                })(
                                    <Checkbox disabled={ this.state.quiteModeEnable } onChange={ this._handleAnnounceChange } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1026" /> }>
                                        <span>{ formatMessage({id: "LANG1025"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('call_menu', {
                                    valuePropName: 'checked',
                                    initialValue: meetList.call_menu === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1039" /> }>
                                            <span>{ formatMessage({id: "LANG1038"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('recording', {
                                    valuePropName: 'checked',
                                    initialValue: meetList.recording === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1035" /> }>
                                        <span>{ formatMessage({id: "LANG1034"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('moh_firstcaller', {
                                    valuePropName: 'checked',
                                    initialValue: meetList.moh_firstcaller === 'yes'
                                })(
                                    <Checkbox onChange={ this._handleMusicclassChange } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 } className={ this.state.musicclassHidden ? 'display-block' : 'hidden' }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1031" /> }>
                                        <span>{ formatMessage({id: "LANG1031"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('musicclass', {
                                    initialValue: meetList.musicclass || 'default'
                                })(
                                    <Select>
                                        {
                                            this.state.mohNameList.map(function(value, index) {
                                                return <Option value={ value } key={ index }>{ value }</Option>
                                            })
                                        }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1044" /> }>
                                        <span>{ formatMessage({id: "LANG1043"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('skipauth', {
                                    valuePropName: 'checked',
                                    initialValue: meetList.skipauth === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1028" /> }>
                                            <span>{ formatMessage({id: "LANG1027"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('user_invite', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.userInviteEnable
                                })(
                                    <Checkbox onChange={ this._handleUserInviteChange } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default injectIntl(ScheduleConference)
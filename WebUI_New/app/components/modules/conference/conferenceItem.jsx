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

class ConferenceItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            publicEnable: true,
            waitAdminEnable: false,
            quiteModeEnable: false,
            announceCallers: false,
            userInviteEnable: false,
            musicclassHidden: false,
            conferenceItem: {},
            mohNameList: [],
            conferenceRange: [],
            existNumberList: [],
            portExtensionList: []
        }
    }
    componentDidMount() {
        this._getInitData()
        this._getConferenceInfo()
    }
    _getInitData = () => {
        let portExtensionList = this.state.portExtensionList || []
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

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getFeatureCodes'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let featureSettings = data.response.feature_settings
                let parkext = featureSettings.parkext
                let parkpos = featureSettings.parkpos.split('-')

                portExtensionList.push(parkext)

                for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                    portExtensionList.push(i + "")
                }
            }.bind(this)
        })

        this.setState({
            portExtensionList: portExtensionList,
            conferenceRange: UCMGUI.isExist.getRange('conference'),
            existNumberList: UCMGUI.isExist.getList("getNumberList")
        })
    }
    _getConferenceInfo = () => {
        const { formatMessage } = this.props.intl
        const extensionId = this.props.params.id

        if (extensionId) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getConference',
                    conference: extensionId
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const response = res.response || {}
                    const conferenceItem = response.conference || {}

                    this.setState({
                        conferenceItem: conferenceItem,
                        publicEnable: conferenceItem.public ? (conferenceItem.public === 'yes') : true,
                        waitAdminEnable: conferenceItem.wait_admin ? (conferenceItem.wait_admin === 'yes') : false,
                        quiteModeEnable: conferenceItem.quiet_mode ? (conferenceItem.quiet_mode === 'yes') : false,
                        announceCallers: conferenceItem.announce_callers ? (conferenceItem.announce_callers === 'yes') : false,
                        userInviteEnable: conferenceItem.user_invite ? (conferenceItem.user_invite === 'yes') : false,
                        musicclassHidden: conferenceItem.moh_firstcaller === 'yes'
                    })
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }
    }
    _handlePublicChange = (e) => {
        const {formatMessage} = this.props.intl,
            _this = this

        this.setState({
            publicEnable: e.target.checked
        }, () => {
            _this.props.form.validateFieldsAndScroll({force: true})
        })

        if (this.state.userInviteEnable && e.target.checked) {
            Modal.confirm({
                content: formatMessage({id: "LANG2433"}, {
                        0: formatMessage({id: "LANG1027"}),
                        1: formatMessage({id: "LANG2431"})
                    }),
                okText: formatMessage({id: "LANG727" }),
                cancelText: formatMessage({id: "LANG726" }),
                onOk() {
                    _this.props.form.setFieldsValue({
                        public: true
                    })

                    _this.setState({
                        publicEnable: true
                    })
                },
                onCancel() {
                    _this.props.form.setFieldsValue({
                        public: false
                    })

                    _this.setState({
                        publicEnable: false
                    })
                }
            })
        }
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

        if (this.state.publicEnable && e.target.checked) {
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
    _handleCancel = () => {
        browserHistory.push('/call-features/conference')
    }
    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const extensionId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage, 0)

                let action = values

                action.public = (action.public ? 'yes' : 'no')
                action.wait_admin = (action.wait_admin ? 'yes' : 'no')
                action.quiet_mode = (action.quiet_mode ? 'yes' : 'no')
                action.announce_callers = (action.announce_callers ? 'yes' : 'no')
                action.call_menu = (action.call_menu ? 'yes' : 'no')
                action.recording = (action.recording ? 'yes' : 'no')
                action.moh_firstcaller = (action.moh_firstcaller ? 'yes' : 'no')
                action.skipauth = (action.skipauth ? 'yes' : 'no')
                action.user_invite = (action.user_invite ? 'yes' : 'no')

                if (action.moh_firstcaller === 'no') {
                    delete action.musicclass
                }

                if (action.public === 'yes') {
                    delete action.pincode
                    delete action.admin_pincode
                    delete action.wait_admin
                }

                if (extensionId) {
                    action.action = 'updateConference'
                    delete action.extension
                    action.conference = extensionId
                } else {
                    action.action = 'addConference'
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
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

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
    _createConference = () => {
        let conferenceRange = this.state.conferenceRange,
            existNumberList = this.state.existNumberList,
            startCon = conferenceRange[0],
            endCon = conferenceRange[1],
            i = startCon

        for (i; i <= endCon; i++) {
            if (_.indexOf(existNumberList, i.toString()) === -1) {
                return i
            }
        }

        return i
    }
    _checkConferenceName = (data, val, callback, formatMessage) => {
        var existed = true
        const existNumberList = this.state.existNumberList
        const currentEditId = this.props.params.id

        if (currentEditId) {
            if (val === currentEditId) {
                existed = true
            } else {
                if (_.indexOf(existNumberList, val) > -1) {
                    existed = false
                } else {
                    existed = true
                }
            }
        } else {
            if (_.indexOf(existNumberList, val) > -1) {
                existed = false
            } else {
                existed = true
            }
        }

        if (existed === false) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _checkIfInPort = (data, val, callback, formatMessage, msg) => {
        var existed = true
        const portExtensionList = this.state.portExtensionList

        if (_.indexOf(portExtensionList, parseInt(val)) > -1) {
            existed = false
        } else {
            existed = true
        }

        if (existed === false) {
            callback(formatMessage({id: "LANG2172"}, {0: msg}))
        } else {
            callback()
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const { form } = this.props
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG595"}),
                    1: this.props.params.id
                })
                : formatMessage({id: "LANG731"}))

        const conferenceItem = this.state.conferenceItem || {}
        let extension = conferenceItem.extension

        if (!extension) {
            extension = this._createConference()
        }

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
                    isDisplay='display-block'/>
                <div className="content">
                    <Form>
                        <Row>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1030" /> }>
                                            <span>{ formatMessage({id: "LANG1029"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('extension', {
                                        rules: [
                                            {
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this._checkConferenceName(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this._checkIfInPort(data, value, callback, formatMessage, formatMessage({id: "LANG1244"}) + ", " + formatMessage({id: "LANG1242"}))
                                                }
                                            }],
                                        initialValue: extension
                                    })(
                                        <Input disabled={ !!this.props.params.id } />
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
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
                                        initialValue: this.state.publicEnable
                                    })(
                                        <Checkbox disabled={ this.state.waitAdminEnable } onChange={ this._handlePublicChange } />
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
                                        <Checkbox disabled={ this.state.publicEnable } onChange={ this._handleWaitAdminChange } />
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
                                                    !this.state.publicEnable ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    !this.state.publicEnable ? Validator.minlength(data, value, callback, formatMessage, 4) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    let val = form.getFieldValue('admin_pincode')
                                                    !this.state.publicEnable ? Validator.notEqualTo(data, value, callback, formatMessage, val, formatMessage({id: "LANG1020"})) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    !this.state.publicEnable ? Validator.checkNumericPw(data, value, callback, formatMessage) : callback()
                                                }
                                            }],
                                        initialValue: conferenceItem.pincode
                                    })(
                                        <Input disabled={ this.state.publicEnable } />
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
                                                required: !this.state.publicEnable,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    !this.state.publicEnable ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    !this.state.publicEnable ? Validator.minlength(data, value, callback, formatMessage, 4) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    let val = form.getFieldValue('pincode')
                                                    !this.state.publicEnable ? Validator.notEqualTo(data, value, callback, formatMessage, val, formatMessage({id: "LANG1032"})) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    !this.state.publicEnable ? Validator.checkNumericPw(data, value, callback, formatMessage) : callback()
                                                }
                                            }],
                                        initialValue: conferenceItem.admin_pincode
                                    })(
                                        <Input disabled={ this.state.publicEnable } />
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
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1023" /> }>
                                                <span>{ formatMessage({id: "LANG1022"}) }</span>
                                            </Tooltip>
                                        </span>
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
                                        initialValue: conferenceItem.call_menu === 'yes'
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
                                        initialValue: conferenceItem.recording === 'yes'
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
                                        initialValue: conferenceItem.moh_firstcaller === 'yes'
                                    })(
                                        <Checkbox onChange={ this._handleMusicclassChange } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 } className={ this.state.musicclassHidden ? 'display-block' : 'hidden' }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1031" /> }>
                                                <span>{ formatMessage({id: "LANG1031"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('musicclass', {
                                        initialValue: conferenceItem.musicclass || 'default'
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
                                        initialValue: conferenceItem.skipauth === 'yes'
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
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(ConferenceItem))
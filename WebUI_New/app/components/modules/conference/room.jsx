'use strict'

import $ from 'jquery'
import api from "../../api/api"
import _ from 'underscore'
import UCMGUI from "../../api/ucmgui"
import { connect } from 'react-redux'
import Validator from "../../api/validator"
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Popconfirm, Table, Tag, Form, Input, Modal, Checkbox, Tooltip } from 'antd'

const FormItem = Form.Item

let timer = null

let limitConference = 3,
    limitConferenceMembers = 25,
    conferenceRange = []

class Room extends Component {
    constructor(props) {
        super(props)
        this.state = {
            confoList: [],
            visible: false,
            limitVisible: false,
            members: {}
        }
    }
    componentDidMount() {
        this._getInitData()
        this._getLimit()
        this._initCeiStatus()
    }
    componentWillUnmount() {
        clearTimeout(timer)
    }
    _getLimit = () => {
        let model_info = JSON.parse(localStorage.getItem('model_info'))

        conferenceRange = UCMGUI.isExist.getRange('conference')

        let numFxo = Number(model_info.num_fxo),
            numPri = model_info.num_pri

        if (numPri >= 1) {
            limitConference = 8
            limitConferenceMembers = 64
        }

        if (numFxo > 4) {
            limitConference = 6
            limitConferenceMembers = 32
        }
    }
    _add = () => {
        const { formatMessage } = this.props.intl

        let maxlength = (conferenceRange[1] && conferenceRange[0]) ? (conferenceRange[1] - conferenceRange[0] + 1) : 1,
            conferenceList = this.state.confoList

        if ((conferenceList.length < limitConference) && (conferenceList.length < maxlength)) {
            browserHistory.push('/call-features/conference/add')
        } else if (conferenceList.length >= maxlength) {
            this.setState({
                limitVisible: true
            })
        } else {
            message.error(
                formatMessage({id: "LANG808"}, {
                    0: limitConference,
                    1: formatMessage({id: "LANG98"})
                })
            )
        }  
    }
    _delete = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage, 0)

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                "action": "deleteConference",
                "conference": record.extension
            },
            dataType: 'json',
            async: true,
            success: function(res) {
                var bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._getConfoList()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _edit = (record) => {
        browserHistory.push('/call-features/conference/edit/' + record.extension)
    }
    _conferenceSettings = () => {
        browserHistory.push('/call-features/conference/conferenceSettings')
    }
    _getInitData = () => {
        let _this = this,
            members,
            confoList

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'listConfStatus'
            },
            dataType: 'json',
            async: false,
            success: function(res) {
                confoList = res.response.conference || []
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                'action': 'getConfMemberStatusListSortByExten'
            },
            dataType: 'json',
            async: false,
            success: function(res) {
                members = res.response || {}

                this.setState({
                    members: members
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            confoList: confoList,
            members: members
        })

        timer = setTimeout(_this._getInitData, 5000)
    }
    _getCurrentTime = () => {
        let currentTime = '1970-01-01 00:00:00'

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'checkInfo'
            },
            dataType: 'json',
            async: false,
            success: function(data) {
                if (data && data.status === 0) {
                    currentTime = data.response.current_time
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        return currentTime
    }
    _getActivityTime = (text) => {
        if (text === '--' || text === undefined) {
            return '--'
        }

        let startTime = text.replace(/-/g, "/"),
            endTime = this._getCurrentTime().replace(/-/g, "/"),
            timeAry = endTime.split(' '),
            milliseconds = Date.parse(timeAry[0] + " " + timeAry[1]) - Date.parse(startTime),
            activity = ''

        if (milliseconds < 0) {
            milliseconds = 0
        }

        var days = UCMGUI.addZero(Math.floor(milliseconds / (24 * 3600 * 1000)))

        var leave1 = milliseconds % (24 * 3600 * 1000),
            hours = UCMGUI.addZero(Math.floor(leave1 / (3600 * 1000)))

        var leave2 = leave1 % (3600 * 1000),
            minutes = UCMGUI.addZero(Math.floor(leave2 / (60 * 1000)))

        var leave3 = leave2 % (60 * 1000),
            seconds = UCMGUI.addZero(Math.round(leave3 / 1000))

        if (days === '00') {
            activity = hours + ":" + minutes + ":" + seconds
        } else {
            activity = days + " " + hours + ":" + minutes + ":" + seconds
        }

        return activity
    }
    _initCeiStatus = () => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'getInitCeiStatus'
            },
            dataType: 'json',
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    var init_cei_status = data.response.initCeiStatus
                    this.setState({
                        init_cei_status: init_cei_status === '1'
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _addMcb = (record) => {
        this.setState({
            visible: true,
            type: 'addMcb',
            roomId: record.extension
        })
    }
    _addUser = (record) => {
        this.setState({
            visible: true,
            type: 'addUser',
            roomId: record.extension
        })
    }
    _unLockRoom = (record) => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                'action': 'unlockroom',
                'conf-room': record.extension
            },
            dataType: 'json',
            async: false,
            success: function(data) {
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _lockRoom = (record) => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                'action': 'lockroom',
                'conf-room': record.extension
            },
            dataType: 'json',
            async: false,
            success: function(data) {
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleOk = () => {
        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll((err, values) => {
            let type = this.state.type

            if ((type === 'addUser' && !(err.create_user_id)) ||
                (type === 'addMcb' && !(err.create_remote_room || err.create_remote_pass))) {
                let action = {},
                    type = this.state.type,
                    refs = this.refs

                for (let key in values) {
                    if (values.hasOwnProperty(key)) {
                        let divKey = refs["div_" + key]
                        if (divKey && 
                           divKey.props &&
                            ((divKey.props.className &&
                            divKey.props.className.indexOf("hidden") === -1) ||
                            typeof divKey.props.className === "undefined")) {
                            if (!err || (err && typeof err[key] === "undefined")) {
                                action[key] = UCMGUI.transCheckboxVal(values[key])   
                            } else {
                                return
                            }
                        }
                    }
                }

                if (type === 'addMcb') {
                    action = {
                        'action': 'inviteroom',
                        'conf-room': this.state.roomId,
                        'remote-room': values.create_remote_room + '@' + values.create_remote_pass
                    }
                } else {
                    action = {
                        'action': 'inviteuser',
                        'conf-room': this.state.roomId,
                        'user': values.create_user_id + '@' + (values.need_confirm ? '1' : '0')
                    }
                }

                $.ajax({
                    url: api.apiHost,
                    type: 'post',
                    data: action,
                    dataType: 'json',
                    async: false,
                    success: function(data) {
                        message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG922" })}}></span>)
                        this.setState({
                            visible: false
                        })
                        this.props.form.resetFields()
                    }.bind(this),
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            }
        })
    }
    _handleLimitOk = () => {
        browserHistory.push('/pbx-settings/pbxGeneralSettings')
    }
    _handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    _handleLimitCancel = () => {
        this.setState({
            limitVisible: false
        })
    }
    _mutedRequest = (record) => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                'action': 'muteuser',
                'conf-room': record.extension,
                'conf-user': record.channel_name
            },
            dataType: 'json',
            success: function(data) {
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _unMutedRequest = (record) => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                'action': 'unmuteuser',
                'conf-room': record.extension,
                'conf-user': record.channel_name
            },
            dataType: 'json',
            success: function(data) {
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _delUser = (record) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                'action': 'kickuser',
                'conf-room': record.extension,
                'conf-user': record.channel_name
            },
            dataType: 'json',
            success: function(data) {
                message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG819" })}}></span>)
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _renderOptions = (record) => {
        const { formatMessage } = this.props.intl
        let addMcb, addUser, lock, del,
            isLock = record.is_locked === 1,
            isEmpty = record.attend_count === 0

        if (isEmpty) {
            lock = <span
                        className= "sprite sprite-room-lock-disabled"
                        title={ formatMessage({id: 'LANG789'}) }
                    ></span>

            del = <Popconfirm
                        title={ formatMessage({id: "LANG841"}) }
                        okText={ formatMessage({id: "LANG727"}) }
                        cancelText={ formatMessage({id: "LANG726"}) }
                        onConfirm={ this._delete.bind(this, record) }
                    >
                        <span
                            className={ "sprite sprite-del" }
                            title={ formatMessage({id: "LANG739"}) }>
                        </span>
                    </Popconfirm>
        } else {
            lock = <span
                        className={ "sprite " + (isLock ? 'sprite-room-lock' : 'sprite-room-unlock') }
                        title={ isLock ? formatMessage({id: 'LANG788'}) : formatMessage({id: 'LANG787'}) }
                        onClick={ isLock ? this._unLockRoom.bind(this, record) : this._lockRoom.bind(this, record) }
                    ></span>

            del = <span
                        className={ "sprite sprite-del-disabled" }
                        title={ formatMessage({id: "LANG739"}) }>
                    </span>
        }

        return <div>
                <span
                    className={ 'sprite ' + (isLock ? 'sprite-add-mcb-disabled' : 'sprite-add-mcb') }
                    title={ formatMessage({id: "LANG2695"}) }
                    onClick={ isLock ? '' : this._addMcb.bind(this, record) }
                >
                </span>
                <span
                    className={ 'sprite ' + (isLock ? 'sprite-add-user-disabled' : 'sprite-add-user') }
                    title={ formatMessage({id: "LANG786"}) }
                    onClick={ isLock ? '' : this._addUser.bind(this, record) }
                >
                </span>
                { lock }
                <span
                    className={ "sprite " + (isEmpty ? 'sprite-edit' : 'sprite-edit-disabled') }
                    title={ formatMessage({id: "LANG738"}) }
                    onClick={ isEmpty ? this._edit.bind(this, record) : '' }
                >
                </span>
                { del }
            </div>
    }
    _renderExapndOptions = (record) => {
        const { formatMessage } = this.props.intl

        let mute

        if (record.is_muted === 1) {
            mute = <span
                    className="sprite sprite-unmute"
                    title={ formatMessage({id: "LANG790"}) }
                    onClick = { this._unMutedRequest.bind(this, record) }
                ></span>
        } else {
            mute = <span
                    className="sprite sprite-mute"
                    title={ formatMessage({id: "LANG791"}) }
                    onClick = { this._mutedRequest.bind(this, record) }
                ></span>
        }

        return (
            <div>
                <Popconfirm
                    title={ formatMessage({id: "LANG921"}) + ' ' + record.caller_name + '( ' + record.caller_id + ' ) ?' }
                    okText={ formatMessage({id: "LANG727"}) }
                    cancelText={ formatMessage({id: "LANG726"}) }
                    onConfirm={ this._delUser.bind(this, record) }
                >
                    <span
                        className="sprite sprite-userkick"
                        title={ formatMessage({id: "LANG792"}) }
                    ></span>
                </Popconfirm>
                { mute }
            </div>
        )
    }
    _checkRoomCount = () => {
        let count = 0

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                "action": "listConfStatus",
                "auto-refresh": Math.random()
            },
            dataType: 'json',
            async: false,
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    var roomdata = data.response.conference,
                        length = roomdata.length

                    for (var i = 0; i < length; i++) {
                        count += roomdata[i].attend_count
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        return count
    }
    _ceiNotify = (action) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: action,
            dataType: 'json',
            async: false,
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3910" })}}></span>)
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onChangeCeilStatus = (e) => {
        const { formatMessage } = this.props.intl

        let tragetChecked = e.target.checked

        this.setState({
            init_cei_status: tragetChecked
        })

        if (this._checkRoomCount() === 0) {
            let action = {
                'action': 'setInitCeiStatus'
            }

            if (tragetChecked) {
                action.initCeiStatus = 1
            } else {
                action.initCeiStatus = 0
            }

            this._ceiNotify(action)
        } else {
            message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4481" })}}></span>)
        }
    }
    _renderUser = (text, record, index) => {
        const { formatMessage } = this.props.intl

        return (
            <div>
                <span
                    className={ record.is_talking === 1 ? 'sprite sprite-is-talking' : 'hidden' }
                    title={ record.is_talking === 1 ? formatMessage({ id: "LANG5109" }) : '' }
                ></span>
                <span style={{ marginRight: 6 }}>{ record.user_no }</span>
                <span className='room-role'>
                    { record.is_admin === 1 ? formatMessage({ id: "LANG1047" }) : formatMessage({ id: "LANG1046" }) }
                </span>
            </div>
        )
    }
    render() {
        const { formatMessage } = this.props.intl
        const columns = [{
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG1045"})
            }, {
                key: 'attend_count',
                dataIndex: 'attend_count',
                title: formatMessage({id: "LANG1046"})
            }, {
                key: 'admin_count',
                dataIndex: 'admin_count',
                title: formatMessage({id: "LANG1047"})
            }, {
                key: 'start_time',
                dataIndex: 'start_time',
                title: formatMessage({id: "LANG1048"})
            }, {
                key: 'time',
                dataIndex: 'start_time',
                title: formatMessage({id: "LANG1050"}),
                render: (text, record, index) => {
                    return this._getActivityTime(text)
                }
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return this._renderOptions(record)
                }
            }]

        var conferenceStatus = this.props.conferenceStatus || [],
            confoList = this.state.confoList,
            sourceMembers = this.state.members

        /* _.each(conferenceStatus, function(item, key) {
            let socketExtension = item.extension,
                socketmembers = item.member

            if (!_.has(sourceMembers, socketExtension)) {
                sourceMembers[socketExtension] = socketmembers
            } else {
                _.each(sourceMembers, function(itemSource, key) {
                    if (socketExtension === key) {
                        _.each(socketmembers, function(itemSocket, key) {
                            if (itemSocket.action === 'add') {
                                itemSource.push(itemSocket)
                            } else if (itemSocket.action === 'delete') {
                                _.each(itemSource, function(itemSourceExten, key) {
                                    if (itemSourceExten.caller_id === itemSocket.caller_id) {
                                        itemSource.splice(key, 1)
                                        return false
                                    }
                                })
                            } else if (itemSocket.action === 'update') {
                                _.each(itemSource, function(itemSourceExten, key) {
                                    if (itemSourceExten.caller_id === itemSocket.caller_id) {
                                        itemSource.splice(key, 1, itemSocket)
                                        return false
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }) */

        const expandedRowRender = (e) => {
            const columns = [
                { 
                    title: formatMessage({id: "LANG82"}),
                    dataIndex: 'user_no',
                    key: 'user_no',
                    render: (text, record, index) => {
                        return this._renderUser(text, record, index)
                    }
                }, { 
                    title: formatMessage({id: "LANG78"}),
                    dataIndex: 'caller_id',
                    key: 'caller_id'
                }, {
                    title: formatMessage({id: "LANG79"}),
                    dataIndex: 'caller_name',
                    key: 'caller_name'
                }, {
                    title: formatMessage({id: "LANG80"}),
                    dataIndex: 'channel_name',
                    key: 'channel_name'
                }, {
                    title: formatMessage({id: "LANG1050"}),
                    dataIndex: 'join_time',
                    key: 'join_time',
                    render: (text, record, index) => {
                        return this._getActivityTime(text)
                    }
                }, {
                    key: 'options',
                    dataIndex: 'options',
                    title: formatMessage({id: "LANG74"}),
                    render: (text, record, index) => {
                        return this._renderExapndOptions(record)
                    }
                }
            ]

            let dataSourceMembers = sourceMembers[e.extension]

            return (
                <Table
                    columns={ columns }
                    dataSource={ dataSourceMembers }
                    defaultExpandAllRows = { true }
                    pagination={ false } />
            )
        }

        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        return (
            <div className="app-content-main">
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size="default"
                            onClick={ this._add }
                        >
                            { formatMessage({id: "LANG731"}) }
                        </Button>
                        <Button
                            icon="setting"
                            type="primary"
                            size="default"
                            onClick={ this._conferenceSettings }
                        >
                            { formatMessage({id: "LANG5097"}) }
                        </Button>
                        <span style={{ marginRight: 10 }}>{formatMessage({id: "LANG4480"})}</span>
                        <Checkbox
                            checked={ this.state.init_cei_status }
                            onChange={ this._onChangeCeilStatus } 
                            style={{ position: 'relative', top: -2 }} />
                    </div>
                    <Table
                        rowKey="extension"
                        columns={ columns }
                        pagination={ false }
                        dataSource={ confoList }
                        expandedRowRender = { expandedRowRender }
                        defaultExpandAllRows = { true }
                        showHeader={ !!confoList.length }
                    >
                    </Table>
                    <Modal 
                        title={ formatMessage({id: "LANG1051"}) }
                        visible={this.state.visible}
                        onOk={this._handleOk} 
                        onCancel={this._handleCancel}
                        okText={formatMessage({id: "LANG769"})}
                        cancelText={formatMessage({id: "LANG726"})}>
                        <Form>
                            <div ref="addMcb">
                                <FormItem
                                    { ...formItemLayout }
                                    ref="div_create_remote_room"
                                    className={ this.state.type === "addMcb" ? "display-block" : "hidden" }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2693" /> }>
                                            <span>{formatMessage({id: "LANG2693"})}</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('create_remote_room', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.digits(data, value, callback, formatMessage)
                                            }
                                        }]
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    ref="div_create_remote_pass"
                                    className={ this.state.type === "addMcb" ? "display-block" : "hidden" }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2694" /> }>
                                            <span>{formatMessage({id: "LANG2694"})}</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('create_remote_pass', {
                                        initialValue: '',
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                Validator.digits(data, value, callback, formatMessage)
                                            }
                                        }]
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                            </div>
                            <div ref="addUser">
                                <FormItem
                                    { ...formItemLayout }
                                    ref="div_create_user_id"
                                    className={ this.state.type === "addUser" ? "display-block" : "hidden" }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1042" /> }>
                                            <span>{formatMessage({id: "LANG1042"})}</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('create_user_id', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.digits(data, value, callback, formatMessage)
                                            }
                                        }]
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    ref="div_need_confirm"
                                    className={ this.state.type === "addUser" ? "display-block" : "hidden" }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2352" /> }>
                                            <span>{formatMessage({id: "LANG2351"})}</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('need_confirm')(
                                        <Checkbox />
                                    )}
                                </FormItem>
                            </div>
                        </Form>
                    </Modal>
                    <Modal 
                        title={ formatMessage({id: "LANG2732"}, { 0: conferenceRange[0], 1: conferenceRange[1] }) }
                        visible={this.state.limitVisible}
                        onOk={this._handleLimitOk} 
                        onCancel={this._handleLimitCancel}
                        okText={formatMessage({id: "LANG727"})}
                        cancelText={formatMessage({id: "LANG726"})}>
                    </Modal>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    conferenceStatus: state.conferenceStatus
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default Form.create()(connect(mapStateToProps, mapDispatchToProps)(injectIntl(Room)))
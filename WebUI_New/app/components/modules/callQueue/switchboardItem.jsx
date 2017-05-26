'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Button, Card, Col, Dropdown, Form, Icon, Input, Menu, message, Modal, Row, Select, Table, Tag, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 12 }
}

const InsertModal = Form.create()(
    (props) => {
        const { accountList, record, visible, onCancel, onCreate, form, intl } = props

        const { formatMessage } = intl
        const { getFieldDecorator } = form

        return (
            <Modal
                width={ 650 }
                onOk={ onCreate }
                visible={ visible }
                onCancel={ onCancel }
                title={ formatMessage({ id: "LANG5586" }) }
                okText={ formatMessage({ id: 'LANG728' }) }
                cancelText={ formatMessage({ id: 'LANG726' }) }
            >
                <Form>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG85" /> }>
                                    <span>{ formatMessage({id: "LANG85"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('barge-exten', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }]
                        })(
                            <Select
                                showSearch
                                optionFilterProp="children"
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                placeholder={ formatMessage({id: "LANG5089"}, {0: formatMessage({id: "LANG85"}).toLowerCase()}) }
                                filterOption={ (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
                            >
                                {
                                    accountList.map(function(obj) {
                                            return <Option
                                                        key={ obj.key }
                                                        value={ obj.value }
                                                        className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                        { obj.label }
                                                    </Option>
                                        })
                                }
                            </Select>
                        ) }
                    </FormItem>
                </Form>
            </Modal>
        )
    }
)

const BargingModal = Form.create()(
    (props) => {
        const { accountList, record, visible, onCancel, onCreate, form, intl } = props

        const { formatMessage } = intl
        const { getFieldDecorator } = form

        return (
            <Modal
                width={ 650 }
                onOk={ onCreate }
                visible={ visible }
                onCancel={ onCancel }
                title={ formatMessage({ id: "LANG3008" }) }
                okText={ formatMessage({ id: 'LANG728' }) }
                cancelText={ formatMessage({ id: 'LANG726' }) }
            >
                <Form>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3820" /> }>
                                    <span>{ formatMessage({id: "LANG3820"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('exten', {
                            rules: [],
                            initialValue: record.calleechannel
                        })(
                            <Select>
                                {/* <Option value={ record.callerchannel }>{ record.callerid }</Option> */}
                                <Option value={ record.calleechannel }>{ record.calleeid }</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3819" /> }>
                                    <span>{ formatMessage({id: "LANG3819"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('barge-exten', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }]
                        })(
                            <Select
                                showSearch
                                optionFilterProp="children"
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                placeholder={ formatMessage({id: "LANG5089"}, {0: formatMessage({id: "LANG85"}).toLowerCase()}) }
                                filterOption={ (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
                            >
                                {
                                    accountList.map(function(obj) {
                                            return <Option
                                                        key={ obj.key }
                                                        value={ obj.value }
                                                        className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                        { obj.label }
                                                    </Option>
                                        })
                                }
                            </Select>
                        ) }
                    </FormItem>
                </Form>
            </Modal>
        )
    }
)

const TransferModal = Form.create()(
    (props) => {
        const { accountList, record, visible, onCancel, onCreate, form, intl } = props

        const { formatMessage } = intl
        const { getFieldDecorator } = form

        return (
            <Modal
                width={ 650 }
                onOk={ onCreate }
                visible={ visible }
                onCancel={ onCancel }
                title={ formatMessage({ id: "LANG3887" }) }
                okText={ formatMessage({ id: 'LANG728' }) }
                cancelText={ formatMessage({ id: 'LANG726' }) }
            >
                <Form>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5587" /> }>
                                    <span>{ formatMessage({id: "LANG5587"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('channel', {
                            rules: [],
                            initialValue: record.calleechannel
                        })(
                            <Select>
                                {/* <Option value={ record.callerchannel }>{ record.callerid }</Option> */}
                                <Option value={ record.calleechannel }>{ record.calleeid }</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5588" /> }>
                                    <span>{ formatMessage({id: "LANG5588"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('extension', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }]
                        })(
                            <Select
                                showSearch
                                optionFilterProp="children"
                                notFoundContent={ formatMessage({id: "LANG133"}) }
                                placeholder={ formatMessage({id: "LANG5089"}, {0: formatMessage({id: "LANG85"}).toLowerCase()}) }
                                filterOption={ (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
                            >
                                {
                                    accountList.map(function(obj) {
                                            return <Option
                                                        key={ obj.key }
                                                        value={ obj.value }
                                                        className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                        { obj.label }
                                                    </Option>
                                        })
                                }
                            </Select>
                        ) }
                    </FormItem>
                </Form>
            </Modal>
        )
    }
)

class SwitchBoardItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            record: {},
            accountList: [],
            visibleInsert: false,
            visibleBarging: false,
            visibleTransfer: false
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _createAgentOptions = (text, record, index) => {
        let option
        let membership = record.membership
        let enableAgentLogin = this.props.queueDetail.enable_agent_login

        const { formatMessage } = this.props.intl

        if (membership === 'login') {
            option = <span
                        title={ formatMessage({ id: "LANG259" }) }
                        className="sprite sprite-callcenter-logout"
                        onClick={ this._handleLogout.bind(this, record) }
                    ></span>
        } else {
            option = <span
                        title={ formatMessage({ id: "LANG269" }) }
                        className="sprite sprite-callcenter-loggin"
                        onClick={ this._handleLoggin.bind(this, record) }
                    ></span>
        }

        return option
    }
    _createAnswerOptions = (text, record, index) => {
        let status
        const { formatMessage } = this.props.intl
        const enableAgentLogin = this.props.queueDetail.enable_agent_login

        const menu = <Menu onClick={ this._handleAnwserMenuClick.bind(this, record) }>
                            <Menu.Item key="transfer">
                                <span className="sprite sprite-callcenter-transfer"></span>{ formatMessage({ id: "LANG3887" }) }
                            </Menu.Item>
                            <Menu.Item key="hangup">
                                <span className="sprite sprite-callcenter-hangup"></span>{ formatMessage({ id: "LANG3007" }) }
                            </Menu.Item>
                            <Menu.Item key="insert">
                                <span className="sprite sprite-callcenter-insert"></span>{ formatMessage({ id: "LANG5586" }) }
                            </Menu.Item>
                            <Menu.Item key="barging">
                                <span className="sprite sprite-callcenter-barging"></span>{ formatMessage({ id: "LANG3008" }) }
                            </Menu.Item>
                        </Menu>

        return <Dropdown overlay={ menu } placement="bottomCenter">
                    <span
                        title={ formatMessage({ id: "LANG74" }) }
                        className="sprite sprite-callcenter-options"
                    ></span>
                </Dropdown>
    }
    _createMemberShip = (text, record, index) => {
        let status
        const { formatMessage } = this.props.intl
        const enableAgentLogin = this.props.queueDetail.enable_agent_login

        // console.log(text)
        // console.log(enableAgentLogin)

        if (enableAgentLogin === 'yes') {
            if (text && text === 'login') {
                status = formatMessage({ id: "LANG5186" })
            } else if (text && text === 'logoff') {
                status = formatMessage({ id: "LANG5187" })
            }
        } else {
            if (text && text === 'dynamic') {
                status = formatMessage({ id: "LANG5440" })
            } else if (text && text === 'static') {
                status = formatMessage({ id: "LANG220" })
            }
        }

        return status
    }
    _createStatus = (text, record, index) => {
        let status
        let membership = record.membership
        let enableAgentLogin = this.props.queueDetail.enable_agent_login

        const { formatMessage } = this.props.intl

        if (!text || text === 'Unavailable') {
            status = <div className="status-container unavailable">
                        {/* <span
                            className="sprite sprite-status-unavailable"
                            title={ formatMessage({ id: "LANG113" }) }
                        ></span> */}
                        <Tag>{ formatMessage({ id: "LANG113" }) }</Tag>
                    </div>
        } else if (text === 'Idle') {
            status = <div className="status-container idle">
                        {/* <span
                            className="sprite sprite-status-idle"
                            title={ formatMessage({ id: "LANG2232" }) }
                        ></span> */}
                        <Tag>{ formatMessage({ id: "LANG2232" }) }</Tag>
                    </div>
        } else if (text === 'InUse' || text === 'Paused') {
            status = <div className="status-container inuse">
                        {/* <span
                            className="sprite sprite-status-inuse"
                            title={ formatMessage({ id: "LANG2242" }) }
                        ></span> */}
                        <Tag>{ text === 'InUse' ? formatMessage({ id: "LANG2242" }) : formatMessage({ id: "LANG5063" }) }</Tag>
                    </div>
        } else if (text === 'Ringing') {
            status = <div className="status-container ringing">
                        {/* <span
                            className="sprite sprite-status-ringing"
                            title={ formatMessage({ id: "LANG111" }) }
                        ></span> */}
                        <Tag>{ formatMessage({ id: "LANG111" }) }</Tag>
                    </div>
        } else if (text === 'Busy') {
            status = <div className="status-container busy">
                        {/* <span
                            className="sprite sprite-status-busy"
                            title={ formatMessage({ id: "LANG2237" }) }
                        ></span> */}
                        <Tag>{ formatMessage({ id: "LANG2237" }) }</Tag>
                    </div>
        }

        if (enableAgentLogin === 'yes' && membership === 'logoff') {
            status = <div className="status-container unavailable">
                        {/* <span
                            className="sprite sprite-status-unavailable"
                            title={ formatMessage({ id: "LANG113" }) }
                        ></span> */}
                        <Tag>{ formatMessage({ id: "LANG113" }) }</Tag>
                    </div>
        }

        return status
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const disabled = formatMessage({id: "LANG273"})

        let accountList = UCMGUI.isExist.getList('getAccountList', formatMessage)

        accountList = accountList.map(function(item) {
                    return {
                            key: item.extension,
                            value: item.extension,
                            out_of_service: item.out_of_service,
                            label: (item.extension +
                                    (item.fullname ? ' "' + item.fullname + '"' : '') +
                                    (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                        }
                })

        this.setState({
            accountList: accountList || []
        })
    }
    _handleLoggin = (record, event) => {
        const { formatMessage } = this.props.intl
        const loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4737" })}}></span>
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG5186" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                'operatetype': 'login',
                'action': 'loginLogoffQueueAgent',
                'interface': record.member_extension,
                'extension': this.props.queueDetail.extension
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleLogout = (record, event) => {
        const { formatMessage } = this.props.intl
        const loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4737" })}}></span>
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG5187" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                'operatetype': 'logoff',
                'action': 'loginLogoffQueueAgent',
                'interface': record.member_extension,
                'extension': this.props.queueDetail.extension
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleAnwserMenuClick = (record, event) => {
        if (event.key === 'hangup') {
            this._showHangupModal(record.calleechannel, record)
        } else if (event.key === 'insert') {
            this._showInserModal(record)
        } else if (event.key === 'barging') {
            this._showBargingModal(record)
        } else if (event.key === 'transfer') {
            this._showTransferModal(record)
        }
    }
    _handleInsertCancel = () => {
        const form = this.insertForm

        form.resetFields()

        this.setState({ visibleInsert: false })
    }
    _handleInsertCreate = () => {
        const form = this.insertForm
        const { formatMessage } = this.props.intl

        form.validateFields((err, values) => {
            if (err) {
                return
            }

            console.log('Received values of form: ', values)

            const loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4737" })}}></span>
            const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG873" })}}></span>

            message.loading(loadingMessage, 0)

            let record = this.state.record

            $.ajax({
                type: 'get',
                url: api.apiHost + 'action=callbarge&mode=B&channel=' + record.calleechannel + '&exten=' + record.calleeid + '&barge-exten=' + values['barge-exten'],
                // async: false,
                // data: {
                //     'mode': 'B',
                //     'action': 'callbarge',
                //     'exten': record.callerid,
                //     'channel': record.callerchannel,
                //     'barge-exten': values['barge-exten']
                // },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        message.destroy()
                        message.success(successMessage)
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })

            form.resetFields()

            this.setState({ visibleInsert: false })
        })
    }
    _handleBargingCancel = () => {
        const form = this.bargingForm

        form.resetFields()

        this.setState({ visibleBarging: false })
    }
    _handleBargingCreate = () => {
        const form = this.bargingForm
        const { formatMessage } = this.props.intl

        form.validateFields((err, values) => {
            if (err) {
                return
            }

            console.log('Received values of form: ', values)

            const loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4737" })}}></span>
            const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4751" })}}></span>

            message.loading(loadingMessage, 0)

            let exten = values.exten.split(',')

            $.ajax({
                type: 'get',
                url: api.apiHost + 'action=callbarge&mode=&channel=' + exten[0] + '&exten=' + exten[1] + '&barge-exten=' + values['barge-exten'],
                // async: false,
                // data: {
                //     'mode': '',
                //     'exten': exten[1],
                //     'channel': exten[0],
                //     'action': 'callbarge',
                //     'barge-exten': values['barge-exten']
                // },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        message.destroy()
                        message.success(successMessage)
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })

            form.resetFields()

            this.setState({ visibleBarging: false })
        })
    }
    _handleTransferCancel = () => {
        const form = this.transferForm

        form.resetFields()

        this.setState({ visibleTransfer: false })
    }
    _handleTransferCreate = () => {
        const form = this.transferForm
        const { formatMessage } = this.props.intl

        form.validateFields((err, values) => {
            if (err) {
                return
            }

            console.log('Received values of form: ', values)

            const loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4737" })}}></span>
            const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG873" })}}></span>

            message.loading(loadingMessage, 0)

            $.ajax({
                type: 'get',
                url: api.apiHost + 'action=callTransfer&channel=' + values.channel + '&extension=' + values.extension,
                // async: false,
                // data: {
                //     'action': 'callTransfer',
                //     'channel': values.channel,
                //     'extension': values.extension
                // },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        message.destroy()
                        message.success(successMessage)
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })

            form.resetFields()

            this.setState({ visibleTransfer: false })
        })
    }
    _saveInsertFormRef = (form) => {
        this.insertForm = form
    }
    _saveBargingFormRef = (form) => {
        this.bargingForm = form
    }
    _saveTransferFormRef = (form) => {
        this.transferForm = form
    }
    _showHangupModal = (callerchannel, record) => {
        console.log(record)
        console.log(callerchannel)

        const { formatMessage } = this.props.intl
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3011" })}}></span>
        const confirmMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3010" })}}></span>

        confirm({
            onCancel: () => {},
            content: confirmMessage,
            okText: formatMessage({ id: 'LANG727' }),
            cancelText: formatMessage({ id: 'LANG726' }),
            onOk: () => {
                $.ajax({
                    type: 'json',
                    method: 'post',
                    url: api.apiHost,
                    data: {
                        'action': 'hangup',
                        'channel': callerchannel
                    },
                    success: function(res) {
                        const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                        }
                    }.bind(this),
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            }
        })
    }
    _showInserModal = (record) => {
        console.log(record)

        this.setState({
            record: record,
            visibleInsert: true
        })
    }
    _showBargingModal = (record) => {
        console.log(record)

        this.setState({
            record: record,
            visibleBarging: true
        })
    }
    _showTransferModal = (record) => {
        console.log(record)

        this.setState({
            record: record,
            visibleTransfer: true
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const enableAgentLogin = this.props.queueDetail.enable_agent_login

        let loginTime = {
                key: 'logintime',
                dataIndex: 'logintime',
                title: formatMessage({id: "LANG5435"})
            }

        let agentOptions = {
                key: 'option',
                dataIndex: 'option',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return this._createAgentOptions(text, record, index)
                }
            }

        let generalColumns = [{
                key: 'status',
                dataIndex: 'status',
                title: formatMessage({id: "LANG5214"}),
                render: (text, record, index) => {
                    return this._createStatus(text, record, index)
                }
            }, {
                key: 'member_extension',
                dataIndex: 'member_extension',
                title: formatMessage({id: "LANG85"})
            }, {
                key: 'answer',
                dataIndex: 'answer',
                title: formatMessage({id: "LANG5362"})
            }, {
                key: 'abandon',
                dataIndex: 'abandon',
                title: formatMessage({id: "LANG5364"})
            }, {
                key: 'talktime',
                dataIndex: 'talktime',
                title: formatMessage({id: "LANG2238"}),
                render: (text, record, index) => {
                    return UCMGUI.formatSeconds(text)
                }
            }, {
                key: 'membership',
                dataIndex: 'membership',
                title: formatMessage({id: "LANG5439"}),
                render: (text, record, index) => {
                    return this._createMemberShip(text, record, index)
                }
            }]

        if (enableAgentLogin === 'yes') {
            generalColumns.splice(4, 0, loginTime)
            generalColumns.push(agentOptions)
        }

        let answerColumns = [{
                key: 'status',
                dataIndex: 'status',
                title: formatMessage({id: "LANG81"}),
                render: (text, record, index) => {
                    return <span
                                title={ formatMessage({ id: "LANG4287" }) }
                                className="sprite sprite-callcenter-calling"
                            ></span>
                }
            }, {
                key: 'callerid',
                dataIndex: 'callerid',
                title: formatMessage({id: "LANG2646"})
            }, {
                key: 'calleeid',
                dataIndex: 'calleeid',
                title: formatMessage({id: "LANG2647"})
            }, {
                key: 'bridge_time',
                dataIndex: 'bridge_time',
                title: formatMessage({id: "LANG2238"})
            }, {
                key: 'option',
                dataIndex: 'option',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return this._createAnswerOptions(text, record, index)
                }
            }]

        let waitingColumns = [{
                key: 'status',
                dataIndex: 'status',
                title: formatMessage({id: "LANG81"}),
                render: (text, record, index) => {
                    return <span
                                title={ formatMessage({ id: "LANG111" }) }
                                className="sprite sprite-callcenter-ringing"
                            ></span>
                }
            }, {
                key: 'callerid',
                dataIndex: 'callerid',
                title: formatMessage({id: "LANG2646"})
            }, {
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG2647"}),
                render: (text, record, index) => {
                    return this.props.queueDetail.extension
                }
            }, {
                key: 'position',
                dataIndex: 'position',
                title: formatMessage({id: "LANG4663"}),
                sorter: (a, b) => a.position - b.position
            }, {
                key: 'starttime',
                dataIndex: 'starttime',
                title: formatMessage({id: "LANG2238"})
            }, {
                key: 'option',
                dataIndex: 'option',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <span
                                title={ formatMessage({ id: "LANG3007" }) }
                                className="sprite sprite-callcenter-hangup"
                                onClick={ this._showHangupModal.bind(this, record.callerchannel, record) }
                            ></span>
                }
            }]

        return (
            <div className="app-content-main">
                <div className="content">
                    <Row gutter={ 32 }>
                        <Col className="gutter-row" span={ 12 } xs={ 24 } sm={ 12 } md={ 12 } lg={ 12 }>
                            <Card
                                style={{ 'marginTop': '10px' }}
                                className={ 'ant-card-custom ant-card-custom-callcenter' }
                                title={ formatMessage({id: "LANG5460"}) }
                            >
                                <Table
                                    rowKey="position"
                                    pagination={ false }
                                    columns={ waitingColumns }
                                    style={{ height: '300px', overflow: 'auto' }}
                                    dataSource={ _.sortBy(this.props.waitingCallings, (call) => { return call.position }) }
                                />
                            </Card>
                        </Col>
                        <Col className="gutter-row" span={ 12 } xs={ 24 } sm={ 12 } md={ 12 } lg={ 12 }>
                            <Card
                                style={{ 'marginTop': '10px' }}
                                className={ 'ant-card-custom ant-card-custom-callcenter' }
                                title={ formatMessage({id: "LANG5585"}) }
                            >
                                <Table
                                    rowKey="key"
                                    pagination={ false }
                                    columns={ answerColumns }
                                    dataSource={ this.props.answerCallings }
                                    style={{ height: '300px', overflow: 'auto' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Card
                        className={ 'ant-card-custom ant-card-custom-callcenter' }
                        title={ formatMessage({id: "LANG143"}) }
                    >
                        <Table
                            pagination={ false }
                            rowKey="member_extension"
                            columns={ generalColumns }
                            dataSource={ this.props.queueMembers }
                            style={{ height: '406px', overflow: 'auto' }}
                        />
                    </Card>
                    <InsertModal
                        intl={ this.props.intl }
                        ref={ this._saveInsertFormRef }
                        record={ this.state.record }
                        visible={ this.state.visibleInsert }
                        onCancel={ this._handleInsertCancel }
                        onCreate={ this._handleInsertCreate }
                        accountList={ this.state.accountList }
                    />
                    <BargingModal
                        intl={ this.props.intl }
                        ref={ this._saveBargingFormRef }
                        record={ this.state.record }
                        visible={ this.state.visibleBarging }
                        onCancel={ this._handleBargingCancel }
                        onCreate={ this._handleBargingCreate }
                        accountList={ this.state.accountList }
                    />
                    <TransferModal
                        intl={ this.props.intl }
                        ref={ this._saveTransferFormRef }
                        record={ this.state.record }
                        visible={ this.state.visibleTransfer }
                        onCancel={ this._handleTransferCancel }
                        onCreate={ this._handleTransferCreate }
                        accountList={ this.state.accountList }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(SwitchBoardItem)
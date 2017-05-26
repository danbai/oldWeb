'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Row, Button, message, Modal, Tooltip, Table, Tag, Switch, Select, Col, Form, Input, BackTop } from 'antd'
import _ from 'underscore'
import Validator from "../../api/validator"

const confirm = Modal.confirm
const FormItem = Form.Item
const Option = Select.Option

class WarningEventList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            has_contact: 0,
            noButtonIds: [2, 4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            Pmin_send_warningemail: "",
            Pmode_send_warningemail: "",
            Ptype_send_warningemail: "",
            typeDisable: true,
            selectedRowKeys: [],
            selectedRows: []
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        let Pmin_send_warningemail = ""
        let Pmode_send_warningemail = ""
        let Ptype_send_warningemail = ""

        $.ajax({
            url: api.apiHost + "action=getWarningEmailValue",
            method: 'GET',
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    Pmin_send_warningemail = response.Pmin_send_warningemail
                    Pmode_send_warningemail = response.Pmode_send_warningemail
                    Ptype_send_warningemail = response.Ptype_send_warningemail
                    let typeDisable = true
                    if (Pmode_send_warningemail === '0') {
                        typeDisable = true
                    } else if (Pmode_send_warningemail === '1') {
                        typeDisable = false
                    }
                    if (Ptype_send_warningemail === 'minute') {
                        this.setState({
                            minInterval: 0,
                            maxInterval: 59
                        })
                    } else if (Ptype_send_warningemail === 'hour') {
                        this.setState({
                            minInterval: 1,
                            maxInterval: 23
                        })
                    } else if (Ptype_send_warningemail === 'day') {
                        this.setState({
                            minInterval: 1,
                            maxInterval: 30
                        })
                    }

                    this.setState({
                        Pmin_send_warningemail: Pmin_send_warningemail,
                        Pmode_send_warningemail: Pmode_send_warningemail,
                        Ptype_send_warningemail: Ptype_send_warningemail,
                        typeDisable: typeDisable
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _warningStart = () => {
        $.ajax({
            url: api.apiHost + 'action=reloadWarning&warningStart=',
            method: "GET",
            type: 'json',
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                }
            }.bind(this)
        })
    }
    _warningStop = () => {
        $.ajax({
            url: api.apiHost + 'action=reloadWarning&warningStop=',
            method: "GET",
            type: 'json',
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                }
            }.bind(this)
        })
    }
    _reloadCrontabs = () => {
        $.ajax({
            url: api.apiHost + 'action=reloadCrontabs&crontabjobs=',
            method: "GET",
            type: 'json',
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                }
            }.bind(this)
        })
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: []
        })
    }
    _turnOnWarningOK = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        const rowList = this.state.selectedRows
        let selectedRows = this.state.selectedRows
        let ids = []
        rowList.map(function(item) {
            ids.push(item.id)
        })
        // this._warningStop()
        let action = {}
        action.action = "warningUpdateGeneralSettings"
        action.enable = 1
        action.enable_email = ""
        action.id = ids.join(',')
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
                    for (let i = 0; i < rowList.length; i++) {
                        selectedRows[i].enable = '1'
                    }
                    this.setState({
                        selectedRows: selectedRows
                    })
                    // this._warningStart()
                }
                this.props.getWarningGeneral()
                this._getInitData()
                if (_.indexOf(this.state.selectedRowKeys, 16) > -1 &&
                    (localStorage.role === 'privilege_0' || localStorage.role === 'privilege_1')) {
                    confirm({
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4806"})}} ></span>,
                        onOk() {
                            browserHistory.push('/extension-trunk/voipTrunk')
                        },
                        onCancel() {},
                        okText: formatMessage({id: "LANG727"}),
                        cancelText: formatMessage({id: "LANG726"})
                    })
                }
                this._clearSelectRows()
            }.bind(this)
        })
    }
    _turnOffWarningOK = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        const rowList = this.state.selectedRows
        let selectedRows = this.state.selectedRows
        let ids = []
        rowList.map(function(item) {
            ids.push(item.id)
        })
        // this._warningStop()
        let action = {}
        action.action = "warningUpdateGeneralSettings"
        action.enable = 0
        action.enable_email = ""
        action.id = ids.join(',')
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
                    for (let i = 0; i < rowList.length; i++) {
                        selectedRows[i].enable = '0'
                    }
                    this.setState({
                        selectedRows: selectedRows
                    })
                    // this._warningStart()
                }
                this.props.getWarningGeneral()
                this._getInitData()
                this._clearSelectRows()
            }.bind(this)
        })
    }
    _turnOnMailNotificationOK = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        const rowList = this.state.selectedRows
        let ids = []
        rowList.map(function(item) {
            ids.push(item.id)
        })
        // this._warningStop()
        let action = {}
        action.action = "warningUpdateGeneralSettings"
        action.enable = ""
        action.enable_email = 1
        action.id = ids.join(',')
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
                    // this._warningStart()
                }
                this.props.getWarningGeneral()
                this._getInitData()
                this._clearSelectRows()
            }.bind(this)
        })
    }
    _turnOffMailNotificationOK = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        const rowList = this.state.selectedRows
        let ids = []
        rowList.map(function(item) {
            ids.push(item.id)
        })
        // this._warningStop()
        let action = {}
        action.action = "warningUpdateGeneralSettings"
        action.enable = ""
        action.enable_email = 0
        action.id = ids.join(',')
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
                    // this._warningStart()
                }
                this.props.getWarningGeneral()
                this._getInitData()
                this._clearSelectRows()
            }.bind(this)
        })
    }
    _turnOnWarning = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const __this = this
        if (this.state.selectedRowKeys.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {0: formatMessage({id: "LANG2309"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2563"})}} ></span>,
                onOk() {
                    __this._turnOnWarningOK()
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _turnOffWarning = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const __this = this
        if (this.state.selectedRowKeys.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {0: formatMessage({id: "LANG2309"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2564"})}} ></span>,
                onOk() {
                    __this._turnOffWarningOK()
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _turnOnMailNotification = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const __this = this
        const rowList = this.state.selectedRows
        let needTurnWarning = false
        rowList.map(function(item) {
            if (item.enable === '0') {
                needTurnWarning = true
            }
        })
        if (this.state.selectedRowKeys.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {0: formatMessage({id: "LANG2309"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else if (needTurnWarning) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5004"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else if (this.props.has_contact === 0) {
            const rowList = this.state.selectedRows
            let ids = []
            rowList.map(function(item) {
                ids.push(item.id)
            })
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2631"})}} ></span>,
                onOk() {
                    __this._clearSelectRows()
                    __this._gotoWarningContact(ids.join(','))
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2565"})}} ></span>,
                onOk() {
                    __this._turnOnMailNotificationOK()
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _turnOffMailNotification =() => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const __this = this

        if (this.state.selectedRowKeys.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {0: formatMessage({id: "LANG2309"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2566"})}} ></span>,
                onOk() {
                    __this._turnOffMailNotificationOK()
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _onSelectChange = () => {
        
    }
    _warningEnable = (id, value) => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const __this = this
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        let action = {}
        action.action = "warningUpdateGeneralSettings"
        action.enable = value === true ? 1 : 0
        action.enable_email = ""
        action.id = id
        // this._warningStop()
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
                    // this._warningStart()
                }
                if (id === 16 && value === true &&
                    (localStorage.role === 'privilege_0' || localStorage.role === 'privilege_1')) { /* 16 is sip peer trunk status */
                    confirm({
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4806"})}} ></span>,
                        onOk() {
                            browserHistory.push('/extension-trunk/voipTrunk')
                        },
                        onCancel() {},
                        okText: formatMessage({id: "LANG727"}),
                        cancelText: formatMessage({id: "LANG726"})
                    })
                }
                this.props.getWarningGeneral()
                this._getInitData()
            }.bind(this)
        })
    }
    _warningEnableEmail = (id, record, value) => {
        const { form } = this.props
        const { formatMessage } = this.props.intl
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        const isDoCheck = record.enable
        const __this = this
        if (isDoCheck === '0' && record.enable_email === '0') {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4487"})}} ></span>,
                onOk() {
                    __this.props.getWarningGeneral()
                    __this._getInitData()
                }
            })
        } else if (this.props.has_contact === 0 && record.enable_email === '0') {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2631"})}} ></span>,
                onOk() {
                    __this._gotoWarningContact(id + '')
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            // this._warningStop()
            let action = {}
            action.action = "warningUpdateGeneralSettings"
            action.enable = ""
            action.enable_email = value === true ? 1 : 0
            action.id = id
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
                        // this._warningStart()
                    }
                    this.props.getWarningGeneral()
                    this._getInitData()
                }.bind(this)
            })
        }
    }
    _gotoWarningContact = (id) => {
        // browserHistory.push('/maintenance/systemEvent/3')
        this.props.setActiveKey('warningContact', id)
    }
    _createID = (text, record, index) => {
        const { formatMessage } = this.props.intl
        const eventName = [<span>{ formatMessage({id: "LANG2591"}) }</span>,
            <span>{ formatMessage({id: "LANG2592"}) }</span>,
            <span>{ formatMessage({id: "LANG2593"}) }</span>,
            <span>{ formatMessage({id: "LANG2594"}) }</span>,
            <span>{ formatMessage({id: "LANG2595"}) }</span>,
            <span>{ formatMessage({id: "LANG2681"}) }</span>,
            <span>{ formatMessage({id: "LANG2758"}) }</span>,
            <span>{ formatMessage({id: "LANG2759"}) }</span>,
            <span>{ formatMessage({id: "LANG2760"}) }</span>,
            <span>{ formatMessage({id: "LANG2761"}) }</span>,
            <span>{ formatMessage({id: "LANG2762"}) }</span>,
            <span>{ formatMessage({id: "LANG3183"}) }</span>,
            <span>{ formatMessage({id: "LANG3184"}) }</span>,
            <span>{ formatMessage({id: "LANG3277"}) }</span>,
            <span>{ formatMessage({id: "LANG3278"}) }</span>,
            <span>{ formatMessage({id: "LANG3504"}) }</span>,
            <span>{ formatMessage({id: "LANG4779"}) }</span>,
            <span>{ formatMessage({id: "LANG4780"}) }</span>
        ]
        const cellvalue = eventName[text - 1]
        return <div>
            { cellvalue }
            </div>
    }
    _createEnable = (text, record, index) => {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }
        return <div>
                    <Switch checked={ record.enable === "0" ? false : true } checkedChildren={'ON'} unCheckedChildren={'OFF'} onChange={ this._warningEnable.bind(this, index + 1) } />
                </div>
    }
    _createEnableEmail = (text, record, index) => {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }
        return <div>
                    <Switch checked={ record.enable_email === "0" ? false : true } checkedChildren={'ON'} unCheckedChildren={'OFF'} onChange={ this._warningEnableEmail.bind(this, index + 1, record) } />
                </div>
    }
    _createOption = (text, record, index) => {
        const { formatMessage } = this.props.intl
        if ($.inArray(record.id, this.state.noButtonIds) > -1) {
            return <div>
                    <span
                        className="sprite sprite-edit sprite-edit-disabled">
                    </span>
                </div>
        } else {
            return <div>
                    <span
                        className="sprite sprite-edit"
                        title={ formatMessage({id: "LANG738"}) }
                        onClick={ this._edit.bind(this, record, index) }>
                    </span>
                </div>
        }
    }
    _edit = (record, index) => {
        if ($.inArray(index + 1, this.state.noButtonIds) > -1) {

        } else {
            browserHistory.push('/maintenance/systemEvent/warningEventsList/edit/' + record.id)
        }
    }
    _onChangeMode = (e) => {
        if (e === '0') {
            this.setState({
                typeDisable: true
            })
        } else if (e === '1') {
            this.setState({
                typeDisable: false
            })
        }
    }
    _onChangeType = (e) => {
        if (e === 'minute') {
            this.setState({
                minInterval: 0,
                maxInterval: 59
            })
        } else if (e === 'hour') {
            this.setState({
                minInterval: 1,
                maxInterval: 23
            })
        } else if (e === 'day') {
            this.setState({
                minInterval: 1,
                maxInterval: 30
            })
        }
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ 
            selectedRowKeys: selectedRowKeys,
            selectedRows: selectedRows
        })
    }
    _handleSubmit = () => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG844" })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)
                let action = {}
                action.action = 'setWarningEmailValue'
                if (values.Pmode_send_warningemail === '0') {
                    action.action = 'setWarningEmailValue'
                    action.Pmode_send_warningemail = values.Pmode_send_warningemail
                } else if (values.Pmode_send_warningemail === '1') {
                    action.action = 'setWarningEmailValue'
                    action.Pmode_send_warningemail = values.Pmode_send_warningemail
                    action.Pmin_send_warningemail = values.email_circle
                    action.Ptype_send_warningemail = values.Ptype_send_warningemail
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
                            this._reloadCrontabs()
                        }
                    }.bind(this)
                })
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 9 }
        }
        if (this.props.eventListPageReload) {
            this._getInitData()
            this.props.eventListPageReloadFunc(false)
        }
        const warning_general = this.props.warning_general
        const columns = [{
                key: 'id',
                dataIndex: 'id',
                title: formatMessage({id: "LANG2558"}),
                sorter: false,
                render: (text, record, index) => (
                    this._createID(text, record, index)
                )
            }, {
                key: 'enable',
                dataIndex: 'enable',
                title: formatMessage({id: "LANG2559"}),
                sorter: false,
                render: (text, record, index) => (
                    this._createEnable(text, record, index)
                )
            }, {
                key: 'enable_email',
                dataIndex: 'enable_email',
                title: formatMessage({id: "LANG2560"}),
                sorter: false,
                render: (text, record, index) => (
                    this._createEnableEmail(text, record, index)
                )
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG2561"}),
                render: (text, record, index) => (
                    this._createOption(text, record, index)
                )
            }]

        const pagination = {
                total: warning_general.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }

        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG2582"})
                })

        return (
            <div className="app-content-main">
                <div className="content">
                    <Form>
                        <Row>
                            <FormItem
                                ref="div_Pmode_send_warningemail"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG4801" />}>
                                        <span>{formatMessage({id: "LANG4802"})}</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 12 } >
                                    { getFieldDecorator('Pmode_send_warningemail', {
                                        rules: [],
                                        initialValue: this.state.Pmode_send_warningemail
                                    })(
                                        <Select onChange={ this._onChangeMode } >
                                            <Option value='0'>{ formatMessage({id: "LANG4799"}) }</Option>
                                            <Option value='1'>{ formatMessage({id: "LANG4800"}) }</Option>
                                        </Select>
                                    ) }
                                </Col>
                            </FormItem>
                        </Row>
                        <Row>
                            <FormItem
                                ref="div_email_circle"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG4447" />}>
                                        <span>{formatMessage({id: "LANG4446"})}</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 6 } >
                                    { getFieldDecorator('email_circle', {
                                        getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                            validator: (data, value, callback) => {
                                                this.state.typeDisable === false ? Validator.range(data, value, callback, formatMessage, 0, this.state.maxInterval) : callback()
                                            }
                                        }, {
                                            required: this.state.typeDisable === false,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.typeDisable === false ? Validator.digits(data, value, callback, formatMessage) : callback()
                                            }
                                        }],
                                        initialValue: this.state.Pmin_send_warningemail
                                    })(
                                        <Input disabled={ this.state.typeDisable } />
                                    ) }
                                </Col>
                                <Col span={ 6 } >
                                    { getFieldDecorator('Ptype_send_warningemail', {
                                        rules: [],
                                        initialValue: this.state.Ptype_send_warningemail
                                    })(
                                        <Select disabled={ this.state.typeDisable } onChange={ this._onChangeType } >
                                            <Option value='minute'>{ formatMessage({id: "LANG2576"}) }</Option>
                                            <Option value='hour'>{ formatMessage({id: "LANG2577"}) }</Option>
                                            <Option value='day'>{ formatMessage({id: "LANG2578"}) }</Option>
                                        </Select>
                                    ) }
                                </Col>
                            </FormItem>
                        </Row>
                    </Form>
                </div>
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._turnOnWarning }
                        >
                            { formatMessage({id: "LANG2554"}) }
                        </Button>
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._turnOffWarning }
                        >
                            { formatMessage({id: "LANG2555"}) }
                        </Button>
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._turnOnMailNotification }
                        >
                            { formatMessage({id: "LANG2556"}) }
                        </Button>
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._turnOffMailNotification }
                        >
                            { formatMessage({id: "LANG2557"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="id"
                        columns={ columns }
                        pagination={ false }
                        rowSelection={ rowSelection }
                        dataSource={ warning_general }
                        showHeader={ !!warning_general.length }
                    />
                </div>
                <div>
                    <BackTop />
                </div>
            </div>
        )
    }
}

export default injectIntl(WarningEventList)

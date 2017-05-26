'use strict'

import {injectIntl} from 'react-intl'
import { Form, Input, Tabs, message } from 'antd'
import React, { Component, PropTypes } from 'react'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import Warning from './warning'
import WarningContact from './warningContact'
import WarningEventsList from './warningEventsList'

const TabPane = Tabs.TabPane
const baseServerURl = api.apiHost

class WarningIndex extends Component {
    constructor(props) {
        super(props)

        this.state = {
            itemId: '',
            has_contact: 0,
            enEmail: false,
            warning_general: [],
            emailPageReload: false,
            eventListPageReload: false,
            activeKey: this.props.params.id ? this.props.params.id : 'warning',
            isDisplay: !this.props.params.id || this.props.params.id === 'warning' ? "hidden" : 'display-block'
        }
    }
    componentDidMount() {
        this._getWarningGeneral()
        this._getHasContact()
    }
    componentWillUnmount() {

    }
    _getHasContact = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'post',
            async: false,
            url: baseServerURl,
            data: {
                action: 'warningCheckHasContact'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const has_contact = response.body.has_contact

                    this.setState({
                        has_contact: has_contact
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getWarningGeneral = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: baseServerURl,
            data: {
                action: 'warningGetGeneralSettings'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const warning_general = response.body.warning_general || []

                    let enEmail = false

                    warning_general.map(function(item) {
                        if (item.enable_email === '1') {
                            enEmail = true
                        }
                    })

                    this.setState({
                        warning_general: warning_general,
                        enEmail: enEmail
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _changeEnEmail = (value) => {
        this.setState({
            enEmail: value
        })
    }
    _onChange = (activeKey) => {
        if (activeKey === 'warning') {
            this.setState({
                isDisplay: 'hidden',
                activeKey
            })
        } else {
            this.setState({
                isDisplay: 'display-block',
                activeKey
            })
        }
    }
    _warningStart = () => {
        $.ajax({
            url: baseServerURl + 'action=reloadWarning&warningStart=',
            method: "GET",
            type: 'json',
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {}
            }.bind(this)
        })
    }
    _warningStop = () => {
        $.ajax({
            method: "GET",
            type: 'json',
            async: false,
            url: baseServerURl + 'action=reloadWarning&warningStop=',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {}
            }.bind(this)
        })
    }
    _reloadCrontabs = () => {
        $.ajax({
            type: 'json',
            async: false,
            method: "GET",
            url: baseServerURl + 'action=reloadCrontabs&crontabjobs=',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {}
            }.bind(this)
        })
    }
    _handleSubmit = () => {
        let { formatMessage } = this.props.intl
        let activeKey = this.state.activeKey

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG904" }) }}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG844" }) }}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (activeKey === "warningContact") {
                this._warningStop()

                let action = {}

                action.action = 'warningUpdateEmailSettings'

                let admin_email_list = []
                let email_list = []

                for (let i = 0; i <= 9; i++) {
                    if (values[`super_${i}`]) {
                        admin_email_list.push(values[`super_${i}`])
                    }

                    if (values[`manager_${i}`]) {
                        email_list.push(values[`manager_${i}`])
                    }

                    if (err && (err.hasOwnProperty(`super_${i}`) || err.hasOwnProperty(`manager_${i}`))) {
                        return
                    }
                }

                action.admin_email = admin_email_list.join(',')
                action.email = email_list.join(',')

                message.loading(loadingMessage)

                $.ajax({
                    data: action,
                    type: 'post',
                    async: false,
                    url: baseServerURl,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            if (admin_email_list.length > 0 || email_list.length > 0) {
                                this.setState({
                                    has_contact: 1
                                })

                                const itemId = this.state.itemId

                                let actionEn = { }

                                actionEn.action = "warningUpdateGeneralSettings"
                                actionEn.enable = ""
                                actionEn.enable_email = 1 
                                actionEn.id = itemId

                                if (itemId && itemId !== '') {
                                    $.ajax({
                                        type: 'post',
                                        async: false,
                                        url: baseServerURl,
                                        data: actionEn,
                                        error: function(e) {
                                            message.error(e.statusText)
                                        },
                                        success: function(data) {
                                            const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                            if (bool) {
                                                message.destroy()
                                                message.success(successMessage)

                                                this._getWarningGeneral()
                                             }
                                        }.bind(this)
                                    })
                                 }
                            } else if (admin_email_list.length === 0) {
                                this.setState({
                                    has_contact: 0
                                })
                            }
                        }
                    }.bind(this)
                })

                this._warningStart()
            }

            if (activeKey === "warningEventsList") {
                let action_event = {}

                action_event.action = 'setWarningEmailValue'

                if (values.Pmode_send_warningemail === '0') {
                    action_event.action = 'setWarningEmailValue'
                    action_event.Pmode_send_warningemail = values.Pmode_send_warningemail
                } else if (values.Pmode_send_warningemail === '1') {
                    action_event.action = 'setWarningEmailValue'
                    action_event.Pmode_send_warningemail = values.Pmode_send_warningemail
                    action_event.Pmin_send_warningemail = values.email_circle
                    action_event.Ptype_send_warningemail = values.Ptype_send_warningemail
                }

                if (err && (err.hasOwnProperty("Pmode_send_warningemail") || err.hasOwnProperty("email_circle") || err.hasOwnProperty("Ptype_send_warningemail"))) {
                    return
                }

                message.loading(loadingMessage)

                $.ajax({
                    type: 'post',
                    async: false,
                    url: baseServerURl,
                    data: action_event,
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

            // this._warningStop()
            // setTimeout(this._warningStart, 1000)
            this.setState({
                reloadWarning: false
            })
        })
    }
    _handleCancel = () => {
        const { resetFields } = this.props.form

        if (this.state.activeKey === 'warningEventsList') {
            resetFields(['Pmode_send_warningemail', 'email_circle', 'Ptype_send_warningemail'])
            this.setState({
                eventListPageReload: true
            })
        } else if (this.state.activeKey === 'warningContact') {
            for (let i = 0; i <= 9; i++) {
                resetFields([`super_${i}`])
                resetFields([`manager_${i}`])
            }
            this.setState({
                emailPageReload: true
            })
        }
    }
    _setActiveKey = (key, id) => {
        this.setState({
            activeKey: key,
            itemId: id
        })
    }
    _eventListPageReloadFunc = (key) => {
        this.setState({
            eventListPageReload: key
        })
    }
    _emailPageReloadFunc = (key) => {
        this.setState({
            emailPageReload: key
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        const model_info = JSON.parse(localStorage.getItem('model_info'))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG2580"})
                })

        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    onCancel={ this._handleCancel }
                    isDisplay={ this.state.isDisplay }
                    onSubmit={ this._handleSubmit.bind(this) }
                    headerTitle={ formatMessage({id: "LANG2580"}) }
                />
                <Tabs
                    onChange={ this._onChange }
                    activeKey={ this.state.activeKey }
                    animated={ UCMGUI.initConfig.msie ? false : true }
                >
                    <TabPane tab={ formatMessage({id: "LANG2581"}) } key="warning">
                        <Warning 
                            fileList={ this.state.fileList }
                            dataSource={ this.state.basicSettings }
                        />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG2582"}) } key="warningEventsList">
                        <WarningEventsList
                            form={ this.props.form }
                            has_contact={ this.state.has_contact }
                            warning_general={ this.state.warning_general }
                            setActiveKey={ this._setActiveKey }
                            getWarningGeneral={ this._getWarningGeneral }
                            changeEnEmail={ this._changeEnEmail }
                            eventListPageReload={ this.state.eventListPageReload }
                            eventListPageReloadFunc={ this._eventListPageReloadFunc }
                        />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG2546"}) } key="warningContact">
                        <WarningContact
                            form={ this.props.form }
                            enEmail={ this.state.enEmail }
                            emailPageReload={ this.state.emailPageReload }
                            emailPageReloadFunc={ this._emailPageReloadFunc }
                        />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

WarningIndex.propTypes = {
}

export default Form.create()(injectIntl(WarningIndex))
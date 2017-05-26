'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl, formatMessage } from 'react-intl'
import { Form, Input, Button, Checkbox, Popconfirm, message, Tooltip, Select, Upload, Icon, Modal, Table, BackTop } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import _ from 'underscore'
import Validator from "../../api/validator"

const FormItem = Form.Item
const Option = Select.Option

class LoginSetting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sessionItem: {},
            visible: false,
            whiteAddrList: [],
            loginBannedList: [],
            whiteAddrNameList: [],
            pagination_white: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            pagination_banned: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            loading: false
        }
    }
    componentDidMount () {
        this._getInitData()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.whiteAddrNameList, value) > -1) {
            callback(formatMessage({id: "LANG270"}, {0: formatMessage({id: "LANG155"})}))
        } else {
            callback()
        }
    }
    _getInitData = () => {
        this._getLogParam()
        this._updateLoginBanned()
        this._listLoginBanned()
        this._listLoginWhiteAddr()
    }
    _getLogParam = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'getLoginParam'
            },
            type: 'json',
            async: false,
            success: function(res) {
                let sessionItem = res.response

                this.setState({
                    sessionItem: sessionItem
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _updateLoginBanned = () => {
         $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'updateLoginBanned'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)
                if (bool) {

                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listLoginBanned = (
        params = {                
                item_num: 10,
                sidx: "ip",
                sord: "asc",
                page: 1 
            }
        ) => {
        this.setState({loading: true})
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'listLoginBanned',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                let loginBannedListTmp = res.response.login_banned
                let loginBannedList = []

                loginBannedListTmp.map(function(item, index) {
                    let itemobj = _.extend(item, {id: index})
                    loginBannedList.push(itemobj)
                })
                const pagination_banned = this.state.pagination_banned
                // Read total count from server
                pagination_banned.total = res.response.total_item

                this.setState({
                    pagination_banned: pagination_banned,
                    loginBannedList: loginBannedList,
                    loading: false
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listLoginWhiteAddr = (
        params = {                
                item_num: 10,
                sidx: "ip",
                sord: "asc",
                page: 1 
            }
        ) => {
        this.setState({loading: true})
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'listLoginWhiteAddr',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                let whiteAddrList = res.response.login_white_addr
                let whiteAddrNameList = []
                whiteAddrList.map(function(item) {
                    whiteAddrNameList.push(item.ip)
                })

                const pagination_white = this.state.pagination_white
                // Read total count from server
                pagination_white.total = res.response.total_item

                this.setState({
                    pagination_white: pagination_white,
                    whiteAddrList: whiteAddrList,
                    whiteAddrNameList: whiteAddrNameList,
                    loading: false
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleTableChangeBanned = (pagination_banned, filters, sorter) => {
        const pager_banned = this.state.pagination_banned

        pager_banned.current = pagination_banned.current

        this.setState({
            pagination_banned: pager_banned
        })

        this._listLoginBanned({
            item_num: pagination_banned.pageSize,
            page: pagination_banned.current,
            sidx: sorter.field ? sorter.field : 'ip',
            sord: sorter.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _handleTableChangeWhite = (pagination_white, filters, sorter) => {
        const pager_white = this.state.pagination_white

        pager_white.current = pagination_white.current

        this.setState({
            pagination_white: pager_white
        })

        this._listLoginWhiteAddr({
            item_num: pagination_white.pageSize,
            page: pagination_white.current,
            sidx: sorter.field ? sorter.field : 'ip',
            sord: sorter.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _delete_banned = (record) => {
        const { formatMessage } = this.props.intl
        message.loading(formatMessage({id: "LANG877"}))
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'deleteLoginBanned',
                ip: record.ip,
                user_name: record.user_name
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)
                if (bool) {
                    message.destroy()
                    this._listLoginBanned()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _delete_white = (record) => {
        const { formatMessage } = this.props.intl
        message.loading(formatMessage({id: "LANG877"}))
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { 
                action: 'deleteLoginWhiteAddr',
                ip: record.ip
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)
                if (bool) {
                    message.destroy()
                    this._listLoginWhiteAddr()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onCancel = () => {
        const { setFieldsValue } = this.props.form
        this.setState({
            visible: false
        })
        setFieldsValue({
            'white_ip_addr': ''
        })
    }
    _onBtnAdd = () => {
        this.setState({
            visible: true
        })
    }
    _addWhiteAddr = (record) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue, setFieldsValue } = this.props.form
        const white_ip_addr = getFieldValue('white_ip_addr')
        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (err && err.hasOwnProperty('white_ip_addr')) {
                return
            } else {
                if (white_ip_addr && white_ip_addr !== '') {
                    let doAjax = true
                    this.state.whiteAddrNameList.map(function(item) {
                        if (white_ip_addr === item) {
                            doAjax = false
                        }
                    })
                    if (doAjax === false) {

                    } else {
                        $.ajax({
                            url: api.apiHost,
                            method: "post",
                            data: {
                                action: 'addLoginWhiteAddr',
                                ip: white_ip_addr
                            },
                            type: 'json',
                            async: false,
                            error: function(e) {
                                message.error(e.statusText)
                            },
                            success: function(data) {
                                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)
                                const successMessage = <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG815"}) }} ></span>
                                if (bool) {
                                    message.destroy()
                                    message.success(successMessage)
                                     this.setState({
                                        visible: false
                                    })
                                    setFieldsValue({
                                        'white_ip_addr': ''
                                    })
                                    this._listLoginWhiteAddr()
                                }
                            }.bind(this)
                        })
                    }
                }
            }
        }) 
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }
        const sessionItem = this.state.sessionItem

        if (global.httpServerRefreshLoginSettings) {
            global.httpServerRefreshLoginSettings = false
            this._getInitData()
            this.props.form.resetFields(['cookie_timeout', 'login_max_num', 'login_band_time'])
        }

        const columns_banned = [{
                key: 'ip',
                dataIndex: 'ip',
                title: formatMessage({id: "LANG155"}),
                sorter: true
            }, {
                key: 'user_name',
                dataIndex: 'user_name',
                title: formatMessage({id: "LANG2446"}),
                sorter: true
            }, {
                key: 'login_time',
                dataIndex: 'login_time',
                title: formatMessage({id: "LANG4789"}),
                sorter: true
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._delete_banned.bind(this, record) }
                            >
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                        </div>
                }
            }]

        const columns_white = [{
                key: 'ip',
                dataIndex: 'ip',
                title: formatMessage({id: "LANG155"}),
                sorter: true
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._delete_white.bind(this, record) }
                            >
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                        </div>
                }
            }]

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG716"})})

        return (
            <div className="app-content-main">
                <Form>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ formatMessage({id: "LANG3967"}) }>
                                    <span>{ formatMessage({id: "LANG3966"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('cookie_timeout', {
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
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 0, 60)
                                }
                            }],
                            width: 100,
                            initialValue: (sessionItem.cookie_timeout / 60) + ''
                        })(
                            <Input maxLength='2'/>
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ formatMessage({id: "LANG4727"}) }>
                                    <span>{ formatMessage({id: "LANG4726"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('login_max_num', {
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
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 0, 100)
                                }
                            }],
                            width: 100,
                            initialValue: sessionItem.login_max_num
                        })(
                            <Input maxLength='3'/>
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ formatMessage({id: "LANG4729"}) }>
                                    <span>{ formatMessage({id: "LANG4728"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('login_band_time', {
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
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 0, 10000)
                                }
                            }],
                            width: 100,
                            initialValue: (sessionItem.login_band_time / 60) + ''
                        })(
                            <Input maxLength='5'/>
                        ) }
                    </FormItem>
                </Form>
                <Modal
                    title={ formatMessage({id: "LANG4790"}) }
                    visible={ this.state.visible }
                    onOk={ this._addWhiteAddr }
                    onCancel={ this._onCancel }
                    okText={ formatMessage({id: "LANG727"}) }
                    cancelText={ formatMessage({id: "LANG726"}) }
                    >
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={ formatMessage({id: "LANG1291"}) }>
                            { getFieldDecorator('white_ip_addr', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{ 
                                    required: this.state.visible, 
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this.state.visible ? this._checkName : ""
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.visible ? Validator.ipDnsSpecial(data, value, callback, formatMessage) : callback()
                                    }
                                }],
                                initialValue: ''
                            })(
                                <Input maxLength="32" />
                            ) }
                        </FormItem>
                    </Form>
                </Modal>
                <div className="content">
                    <div className="section-title">
                        <span>{ formatMessage({id: "LANG4791"}) }</span>
                    </div>
                    <Table
                        rowKey="id"
                        columns={ columns_banned }
                        pagination={ this.state.pagination_banned }
                        dataSource={ this.state.loginBannedList }
                        showHeader={ !!this.state.loginBannedList.length }
                        onChange={ this._handleTableChangeBanned }
                        loading={ this.state.loading}
                    />
                </div>
                <div className="content">
                    <div className="section-title">
                        <span>{ formatMessage({id: "LANG4793"}) }</span>
                    </div>
                    <div className="top-button">
                        <Button
                            type="primary"
                            icon="plus"
                            size='default'
                            onClick={ this._onBtnAdd }>
                            { formatMessage({id: "LANG769" }) }
                        </Button>
                    </div>
                    <span>{ formatMessage({id: "LANG5024"}) }</span>
                </div>
                <div className="content">
                    <Table
                        rowKey="ip"
                        columns={ columns_white }
                        pagination={ this.state.pagination_white }
                        dataSource={ this.state.whiteAddrList }
                        showHeader={ !!this.state.whiteAddrList.length }
                        onChange={ this._handleTableChangeWhite }
                        loading={ this.state.loading}
                    />
                </div>
                <div>
                    <BackTop />
                </div>
            </div>
        )
    }
}

export default injectIntl(LoginSetting)
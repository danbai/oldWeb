'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Tooltip, Button, message, Modal, Popconfirm, Checkbox, Table, Tag, Form, Input, Row, Col, Collapse, BackTop } from 'antd'

const confirm = Modal.confirm
const FormItem = Form.Item
const Panel = Collapse.Panel

class Security extends Component {
    constructor(props) {
        super(props)
        this.state = {
            netstatInfo: [],
            ruleName: [],
            typicalFirewallsettings: {},
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {},
            totalRule: 0,
            firstLoad: true,
            networkSettings: {},
            ruleAllName: []
        }
    }
    componentDidMount() {
        this._getNetStatInfo()
        this._getInitData()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        browserHistory.push('/system-settings/securitySettings/security/add')
    }
    _delete = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "deleteStaticDefense",
                "rule_name": record.rule_name
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    const pagination = this.state.pagination
                    const pageSize = this.state.pagination.pageSize
                    let current = this.state.pagination.current
                    const old_total = this.state.pagination.total
                    const new_total = old_total - 1
                    const new_total_page = (new_total - 1) / pageSize + 1
                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }
                    pagination.current = current

                    this._getInitData({
                        item_num: pageSize,
                        page: current,
                        sidx: 'sequence',
                        sord: 'asc'
                    })
                    this.setState({
                        pagination: pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _edit = (record) => {
        browserHistory.push('/system-settings/securitySettings/security/edit/' + record.sequence + '/' + record.rule_name)
    }
    _getNetStatInfo = () => {
        const { formatMessage } = this.props.intl
        let netstatInfo = this.state.netstatInfo

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getNetstatInfo'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    netstatInfo = response.netstat || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            netstatInfo: netstatInfo
        })
    }
    _getInitData = (
        params = {                
                item_num: 10,
                sidx: "sequence",
                sord: "asc",
                page: 1 
            }
        ) => {
        const { formatMessage } = this.props.intl
        let ruleName = this.state.ruleName
        let typicalFirewallsettings = this.state.typicalFirewallsettings
        let pagination = this.state.pagination
        let ruleAllName = []
        let networkSettings = {}
        
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listStaticDefense',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    // Read total count from server
                    pagination.total = res.response.total_item
                    ruleName = response.rule_name || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getTypicalFirewallSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    typicalFirewallsettings = response.typical_firewallsettings || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listStaticDefense'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    // Read total count from server
                    pagination.total = res.response.total_item
                    ruleAllName = response.rule_name || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getNetworkSettings',
                method: '',
                port: ''
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    networkSettings = response.network_settings || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        let canReject = false
        ruleAllName.map(function(item) {
            if ((item.rule_act === 'accept' &&
                item.type === 'in' &&
                item.protocol !== 'udp' &&
                item.dest_port === networkSettings.port) &&
                ((networkSettings.method === '1' && item.interface.toUpperCase() === 'LAN') ||
                (networkSettings.method !== '1' && item.interface === 'Both'))) {
                canReject = true
            }
        })
        const reject_all = typicalFirewallsettings.reject_all
        if (canReject === false && reject_all === 'yes') {
            $.ajax({
                url: api.apiHost,
                method: "post",
                data: {
                    action: 'updateTypicalFirewallSettings',
                    reject_all: 'no',
                    _location: 'security'
                },
                type: 'json',
                async: false,
                error: function(e) {
                    message.error(e.statusText)
                },
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                    if (bool) {
                        typicalFirewallsettings.reject_all = 'no'
                        message.destroy()
                        // message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                    }
                }.bind(this)
            })
            // this.props.form.setFieldsValue(reject_all: false)
        }
        this.setState({
            ruleName: ruleName,
            ruleAllName: ruleAllName,
            typicalFirewallsettings: typicalFirewallsettings,
            pagination: pagination,
            firstLoad: false,
            networkSettings: networkSettings
        })
    }
    _checkCanReject = (ruleName) => {
        const networkSettings = this.state.networkSettings

        let canReject = false
        ruleName.map(function(item) {
            if ((item.rule_act === 'accept' &&
                item.type === 'in' &&
                item.protocol !== 'udp' &&
                item.dest_port === networkSettings.port) &&
                ((networkSettings.method === '1' && item.interface.toUpperCase() === 'LAN') ||
                (networkSettings.method !== '1' && item.interface === 'Both'))) {
                canReject = true
            }
        })
        return canReject
    }
    _createNetstatType = (text, record, index) => {
        const type = record.pro + '/' + record.ip
        return <div>
                <span>{ type }</span>
            </div>
    }
    _createDestAddress = (text, record, index) => {
        let span = ''
        if (record.dest_sub) {
            span = 'Address:' + text + '/' + record.dest_sub + ' Port:'
        } else {
            span = 'Address:' + text + ' Port:'
        }

        if (record.dest_port === '-1') {
            span += 'Any'
        } else {
            span += record.dest_port
        }

        return <div><span>{ span }</span></div>
    }
    _createSourceAddress = (text, record, index) => {
        let span = ''
        if (record.source_sub) {
            span = 'Address:' + text + '/' + record.source_sub + ' Port:'
        } else {
            span = 'Address:' + text + ' Port:'
        }

        if (record.source_port === '-1') {
            span += 'Any'
        } else {
            span += record.source_port
        }

        return <div><span>{ span }</span></div>
    }
    _handleTableChange = (pagination, filters, sorter) => {
        const pager = this.state.pagination

        pager.current = pagination.current
        pager.pageSize = pagination.pageSize
        let sorter_here = {}

        if (sorter && sorter.field) {
            this.setState({
                pagination: pager,
                sorter: sorter
            })
            sorter_here = sorter
        } else {
            this.setState({
                pagination: pager
            })
            sorter_here = this.state.sorter
        }

        this._getInitData({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'sequence',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _toTop = (record) => {
        const { formatMessage } = this.props.intl
        const sequence = record.sequence
        if (sequence === 1) {
            return
        }
        const me = this
        var action = {
            "action": "moveStaticDefenseTop",
            "sequence": sequence
        }

        $.ajax({
            method: "post",
            url: api.apiHost,
            data: action,
            async: true,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                const sidx = me.state.sorter.field ? me.state.sorter.field : 'sequence'
                if (bool) {
                    me._getInitData({
                        item_num: me.state.pagination.pageSize ? me.state.pagination.pageSize : 10,
                        page: me.state.pagination.current ? me.state.pagination.current : 1,
                        sidx: sidx,
                        sord: me.state.sorter.order === "descend" ? "desc" : "asc"
                    })
                }
            }
        })
    }
    _toButtom = (record) => {
        const { formatMessage } = this.props.intl
        const sequence = record.sequence
        if (sequence === this.state.pagination.total) {
            return
        }
        const me = this
        var action = {
            "action": "moveStaticDefenseBottom",
            "sequence": sequence
        }

        $.ajax({
            method: "post",
            url: api.apiHost,
            data: action,
            async: true,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                const sidx = me.state.sorter.field ? me.state.sorter.field : 'sequence'
                if (bool) {
                    me._getInitData({
                        item_num: me.state.pagination.pageSize ? me.state.pagination.pageSize : 10,
                        page: me.state.pagination.current ? me.state.pagination.current : 1,
                        sidx: sidx,
                        sord: me.state.sorter.order === "descend" ? "desc" : "asc"
                    })
                }
            }
        })
    }
    _up = (record) => {
        const { formatMessage } = this.props.intl
        const sequence = record.sequence
        if (sequence === 1) {
            return
        }
        const me = this

        var action = {
            "action": "moveStaticDefenseUp",
            "sequence": sequence
        }

        $.ajax({
            method: "post",
            url: api.apiHost,
            data: action,
            async: true,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                const sidx = me.state.sorter.field ? me.state.sorter.field : 'sequence'
                if (bool) {
                    me._getInitData({
                        item_num: me.state.pagination.pageSize ? me.state.pagination.pageSize : 10,
                        page: me.state.pagination.current ? me.state.pagination.current : 1,
                        sidx: sidx,
                        sord: me.state.sorter.order === "descend" ? "desc" : "asc"
                    })
                }
            }
        })
    }
    _down = (record) => {
        const { formatMessage } = this.props.intl
        const sequence = record.sequence
        if (sequence === this.state.pagination.total) {
            return
        }
        const me = this

        var action = {
            "action": "moveStaticDefenseDown",
            "sequence": sequence
        }

        $.ajax({
            method: "post",
            url: api.apiHost,
            data: action,
            async: true,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                const sidx = me.state.sorter.field ? me.state.sorter.field : 'sequence'
                if (bool) {
                    me._getInitData({
                        item_num: me.state.pagination.pageSize ? me.state.pagination.pageSize : 10,
                        page: me.state.pagination.current ? me.state.pagination.current : 1,
                        sidx: sidx,
                        sord: me.state.sorter.order === "descend" ? "desc" : "asc"
                    })
                }
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const networkSettings = this.state.networkSettings
        const ruleName = this.state.ruleName
        const canReject = this._checkCanReject(this.state.ruleAllName)

        if (this.state.firstLoad && this.props.firstLoad) {
            this._getInitData()
        }
        if (!this.state.firstLoad && !this.props.firstLoad) {
            this.setState({
                firstLoad: true
            })
        }

        const columns_rules = [{
                key: 'sequence',
                dataIndex: 'sequence',
                title: formatMessage({id: "LANG1957"}),
                sorter: false
            }, {
                key: 'rule_name',
                dataIndex: 'rule_name',
                title: formatMessage({id: "LANG1947"}),
                sorter: false
            }, {
                key: 'rule_act',
                dataIndex: 'rule_act',
                title: formatMessage({id: "LANG1948"}),
                sorter: false
            }, {
                key: 'protocol',
                dataIndex: 'protocol',
                title: formatMessage({id: "LANG1949"}),
                sorter: false
            }, {
                key: 'type',
                dataIndex: 'type',
                title: formatMessage({id: "LANG1950"}),
                sorter: false
            }, {
                key: 'source_addr',
                dataIndex: 'source_addr',
                title: formatMessage({id: "LANG1952"}),
                sorter: false,
                render: (text, record, index) => {
                    return this._createSourceAddress(text, record, index)
                }
            }, {
                key: 'dest_addr',
                dataIndex: 'dest_addr',
                title: formatMessage({id: "LANG1953"}),
                sorter: false,
                render: (text, record, index) => {
                    return this._createDestAddress(text, record, index)
                }
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG1958"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG738"}) }
                                onClick={ this._edit.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._delete.bind(this, record) }
                            >
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                            <span
                                className="sprite sprite-top"
                                title={ formatMessage({id: "LANG793"}) }
                                onClick={ this._toTop.bind(this, record) }>
                            </span>
                            <span
                                className="sprite sprite-up"
                                title={ formatMessage({id: "LANG794"}) }
                                onClick={ this._up.bind(this, record) }>
                            </span>
                            <span
                                className="sprite sprite-down"
                                title={ formatMessage({id: "LANG795"}) }
                                onClick={ this._down.bind(this, record) }>
                            </span>
                            <span
                                className="sprite sprite-bottom"
                                title={ formatMessage({id: "LANG796"}) }
                                onClick={ this._toButtom.bind(this, record) }>
                            </span>
                        </div>
                }
            }]
        const pagination = {
                total: this.state.ruleName.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }
        const columns_netstat = [{
                key: 'port',
                dataIndex: 'port',
                title: formatMessage({id: "LANG1956"}),
                sorter: false
            }, {
                key: 'service',
                dataIndex: 'service',
                title: formatMessage({id: "LANG1955"}),
                sorter: false
            }, {
                key: 'type',
                dataIndex: 'type',
                title: formatMessage({id: "LANG1954"}),
                sorter: false,
                render: (text, record, index) => {
                    return this._createNetstatType(text, record, index)
                }
            }]
        
        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG5301"})
                })
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const formItemPingLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 2 }
        }
        const typicalFirewallsettings = this.state.typicalFirewallsettings
        let ping_enable_wan = false
        let ping_enable_lan = false
        let ping_of_death_wan = false
        let ping_of_death_lan = false
        if (typicalFirewallsettings.ping_enable) {
            const en_list = typicalFirewallsettings.ping_enable.split(',')
            for (let i = 0; i < en_list.length; i++) {
                if (en_list[i] === 'WAN' || en_list[i] === 'LAN1') {
                    ping_enable_wan = true
                } else if (en_list[i] === 'LAN' || en_list[i] === 'LAN2' || en_list[i] === 'lan') {
                    ping_enable_lan = true
                }
            }
        }
        if (typicalFirewallsettings.ping_of_death) {
            const en_list = typicalFirewallsettings.ping_of_death.split(',')
            for (let i = 0; i < en_list.length; i++) {
                if (en_list[i] === 'WAN' || en_list[i] === 'LAN1') {
                    ping_of_death_wan = true
                } else if (en_list[i] === 'LAN' || en_list[i] === 'LAN2' || en_list[i] === 'lan') {
                    ping_of_death_lan = true
                }
            }
        }
        return (
            <div className="app-content-main">
                <div className="content">
                    <Collapse defaultActiveKey={['1']}>
                        <Panel header={ formatMessage({id: "LANG1936" })} key="1">
                            <Table
                                rowKey=""
                                columns={ columns_netstat }
                                pagination={ false }
                                dataSource={ this.state.netstatInfo }
                                showHeader={ !!this.state.netstatInfo.length }
                            />
                        </Panel>
                    </Collapse>
                </div>
                <div className="content">
                    <div className='section-title section-title-specail'>
                        <span>
                            { formatMessage({id: "LANG2231" })}
                        </span>
                    </div>
                    <Row>
                        <Col span={ 6 } >
                            <Button
                                icon="plus"
                                type="primary"
                                size='default'
                                onClick={ this._add }
                            >
                                { formatMessage({id: "LANG1935"}) }
                            </Button>
                        </Col>
                        <Col span={ 18 } >
                            <FormItem
                                ref="div_rejectAll"
                                { ...formItemLayout }

                                label={(
                                    <Tooltip title={<FormattedHTMLMessage id="LANG2753" />}>
                                        <span>{formatMessage({id: "LANG2752"})}</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('reject_all', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.typicalFirewallsettings.reject_all === 'yes'
                                })(
                                    <Checkbox disabled={ canReject === false } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Table
                        rowKey="sequence"
                        columns={ columns_rules }
                        dataSource={ this.state.ruleName }
                        showHeader={ !!this.state.ruleName.length }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading}
                    />
                </div>
                <div className="content">
                    <div className='section-title section-title-specail'>
                        <span>
                            { formatMessage({id: "LANG1937" })}
                        </span>
                    </div>
                    <Row>
                        <Col span={ 4 }>
                            <Tooltip title={<FormattedHTMLMessage id="LANG2214" />}>
                                <span>{formatMessage({id: "LANG1940"})}</span>
                            </Tooltip>
                        </Col>
                        <Col span={ 5 } className={ networkSettings.method === '1' ? 'hidden' : 'display-block' }>
                            <FormItem
                                { ...formItemPingLayout }

                                label={(
                                    <span>{ networkSettings.method === '2' ? 'eth0(LAN1)' : 'eth1(WAN)' }</span>
                                )}>
                                { getFieldDecorator('ping_enable_wan', {
                                    rules: [],
                                    width: 100,
                                    valuePropName: 'checked',
                                    initialValue: ping_enable_wan
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 5 } >
                            <FormItem
                            { ...formItemPingLayout }

                                label={(
                                    <span>{ networkSettings.method === '2' ? 'eth1(LAN2)' : 'eth0(LAN)' }</span>
                                )}>
                                { getFieldDecorator('ping_enable_lan', {
                                    rules: [],
                                    width: 100,
                                    valuePropName: 'checked',
                                    initialValue: ping_enable_lan
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 4 }>
                            <Tooltip title={<FormattedHTMLMessage id="LANG2213" />}>
                                <span>{formatMessage({id: "LANG1942"})}</span>
                            </Tooltip>
                        </Col>
                        <Col span={ 5 } className={ networkSettings.method === '1' ? 'hidden' : 'display-block' }>
                            <FormItem
                                { ...formItemPingLayout }

                                label={(
                                    <span>{ networkSettings.method === '2' ? 'eth0(LAN1)' : 'eth1(WAN)' }</span>
                                )}>
                                { getFieldDecorator('ping_of_death_wan', {
                                    rules: [],
                                    width: 100,
                                    valuePropName: 'checked',
                                    initialValue: ping_of_death_wan
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 5 } >
                            <FormItem
                            { ...formItemPingLayout }

                                label={(
                                    <span>{ networkSettings.method === '2' ? 'eth1(LAN2)' : 'eth0(LAN)' }</span>
                                )}>
                                { getFieldDecorator('ping_of_death_lan', {
                                    rules: [],
                                    width: 100,
                                    valuePropName: 'checked',
                                    initialValue: ping_of_death_lan
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                </div>
                <div>
                    <BackTop />
                </div>
            </div>
        )
    }
}

export default injectIntl(Security)

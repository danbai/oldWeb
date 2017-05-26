'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag } from 'antd'

const confirm = Modal.confirm

class WakeupService extends Component {
    constructor(props) {
        super(props)
        this.state = {
            accountList: [],
            accountAryObj: {},
            selectedRowName: "",
            selectedRowKeys: [],
            wakeupService: [],
            batchDeleteModalVisible: false
        }
    }
    componentDidMount() {
        this._getAccountList()
        this._getWakeupService()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        let confirmContent = ''
        const { formatMessage } = this.props.intl

        confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG880" })}}></span>

        if (!this.state.accountList.length) {
            confirm({
                content: confirmContent,
                onOk() {
                    browserHistory.push('/extension-trunk/extension')
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        } else {
            browserHistory.push('/user-value-added-features/userWakeupService/add')
        }
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: []
        })
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
                "action": "deleteWakeupSchedule",
                "wakeup_index": record.wakeup_index
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._getWakeupService()
                    this._clearSelectRows()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _deleteBatch = () => {
        let selectedRowName = this.state.selectedRowKeys.join('  ')
        const selectedRowKeys = this.state.selectedRowKeys
        let selectedRowList = []

        this.state.wakeupService.map(function(item) {
            for (let i = 0; i < selectedRowKeys.length; i++) {
                if (selectedRowKeys[i] === item.wakeup_index) {
                    selectedRowList.push(item.wakeup_name)
                }
            }
        })
        selectedRowName = selectedRowList.join('  ')
        this.setState({
            batchDeleteModalVisible: true,
            selectedRowName: selectedRowName
        })
    }
    _deleteBatchCancel = () => {
        this.setState({
            batchDeleteModalVisible: false
        })
    }
    _deleteBatchOk = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)
        this.setState({
            batchDeleteModalVisible: false
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "deleteWakeupSchedule",
                "wakeup_index": this.state.selectedRowKeys.join(',')
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._getWakeupService()
                    this._clearSelectRows()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _edit = (record) => {
        browserHistory.push('/user-value-added-features/userWakeupService/edit/' + record.wakeup_index + "/" + record.wakeup_name)
    }
    _getAccountList = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getAccountList' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let obj = {}
                    let response = res.response || {}
                    let extension = response.extension || []

                    extension.map(function(item) {
                        obj[item.extension] = item
                    })

                    this.setState({
                        accountAryObj: obj,
                        accountList: extension
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getWakeupService = () => {
        const { formatMessage } = this.props.intl
        const username = JSON.parse(localStorage.getItem('username'))

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getUserWakeupSchedule',
                extension: username
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const wakeupService = response.wakeup || []

                    this.setState({
                        wakeupService: wakeupService
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ selectedRowKeys })
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'wakeup_index',
                dataIndex: 'wakeup_index',
                title: formatMessage({id: "LANG135"}),
                className: "hidden",
                sorter: (a, b) => a.wakeup_index.length - b.wakeup_index.length
            }, {
                key: 'wakeup_name',
                dataIndex: 'wakeup_name',
                title: formatMessage({id: "LANG135"}),
                sorter: (a, b) => a.wakeup_name.length - b.wakeup_name.length
            }, {
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG85"}),
                sorter: (a, b) => a.extension.length - b.extension.length
            }, {
                key: 'wakeup_enable',
                dataIndex: 'wakeup_enable',
                title: formatMessage({id: "LANG81"}),
                render: (text, record, index) => {
                    if (text === 1) {
                        return <span>{ formatMessage({id: "LANG5220"}) }</span>
                    } else {
                        return <span>{ formatMessage({id: "LANG5219"}) }</span>
                    }
                },
                sorter: (a, b) => a.wakeup_enable.length - b.wakeup_enable.length
            }, {
                key: 'custom_date',
                dataIndex: 'custom_date',
                title: formatMessage({id: "LANG203"}),
                render: (text, record, index) => {
                    if (!text) {
                        return <span>{ text }</span>
                    } else if (text.indexOf('-') > -1) {
                        return <span>{ text }</span>
                    } else {
                        const weeklist = text.split(',')
                        const weektmp = []
                        const weektext = weeklist.map(function(item, index) {
                                if (item === '0') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG250"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG250"}) }</span>
                                    }
                                } else if (item === '1') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG251"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG251"}) }</span>
                                    }
                                } else if (item === '2') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG252"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG252"}) }</span>
                                    }
                                } else if (item === '3') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG253"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG253"}) }</span>
                                    }
                                } else if (item === '4') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG254"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG254"}) }</span>
                                    }
                                } else if (item === '5') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG255"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG255"}) }</span>
                                    }
                                } else if (item === '6') {
                                    if (index === 0) {
                                        return <span>{ formatMessage({id: "LANG256"}) }</span>
                                    } else {
                                        return <span>,{ formatMessage({id: "LANG256"}) }</span>
                                    }
                                }
                            }
                        )
                        return <span>{ weektext }</span>
                    }
                },
                sorter: (a, b) => a.custom_date.length - b.custom_date.length
            }, {
                key: 'time',
                dataIndex: 'time',
                title: formatMessage({id: "LANG247"}),
                sorter: (a, b) => a.time.length - b.time.length
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
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
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) } ></span>
                            </Popconfirm>
                        </div>
                }
            }]
        const pagination = {
                total: this.state.wakeupService.length,
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
                    1: formatMessage({id: "LANG4858"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG4858"}) }
                    isDisplay='hidden'
                />
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._add }
                        >
                            { formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG4858"}) }) }
                        </Button>
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._deleteBatch }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG3872"}, {0: formatMessage({id: "LANG4858"}) }) }
                        </Button>
                        <Modal
                            onOk={ this._deleteBatchOk }
                            onCancel={ this._deleteBatchCancel }
                            title={ formatMessage({id: "LANG543"}) }
                            okText={ formatMessage({id: "LANG727"}) }
                            cancelText={ formatMessage({id: "LANG726"}) }
                            visible={ this.state.batchDeleteModalVisible }
                        >
                            <span dangerouslySetInnerHTML=
                                {{__html: formatMessage({id: "LANG2710"}, {0: formatMessage({id: "LANG4858"}), 1: this.state.selectedRowName})}}
                            ></span>
                        </Modal>
                    </div>
                    <Table
                        rowKey="wakeup_index"
                        columns={ columns }
                        pagination={ pagination }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.wakeupService }
                        showHeader={ !!this.state.wakeupService.length }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(WakeupService)

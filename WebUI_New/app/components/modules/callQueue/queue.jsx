'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Badge, Button, message, Popconfirm, Popover, Table, Tag } from 'antd'

class Queue extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // extgroupObj: {},
            // extgroupList: [],
            // callQueueList: []
        }
    }
    componentDidMount () {
        // this._getExtensionGroupList()
        // this._getCallQueue()
    }
    _add = () => {
        browserHistory.push('/call-features/callQueue/add')
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
                "action": "deleteQueue",
                "queue": record.extension
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this.props.refreshCallQueue()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _edit = (record) => {
        browserHistory.push('/call-features/callQueue/edit/' + record.extension)
    }
    _getExtensionGroupList = () => {
        let extgroupObj = {}
        let extgroupList = []

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getExtensionGroupList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}

                    extgroupList = response.extension_groups || []

                    extgroupList.map(function(item) {
                        extgroupObj[item.group_id] = item
                    })

                    this.setState({
                        extgroupObj: extgroupObj,
                        extgroupList: extgroupList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getCallQueue = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listQueue',
                sidx: 'extension',
                sord: 'asc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const callQueueList = response.queue || []

                    this.setState({
                        callQueueList: callQueueList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _settings = () => {
        browserHistory.push('/call-features/callQueue/settings')
    }
    _statistics = () => {
        browserHistory.push('/call-features/callQueue/statistics')
    }
    _strategy = (value) => {
        let strategy
        const { formatMessage } = this.props.intl

        switch (value) {
            case 'ringall':
                strategy = formatMessage({id: "LANG1197"})
                break
            case 'linear':
                strategy = formatMessage({id: "LANG1198"})
                break
            case 'leastrecent':
                strategy = formatMessage({id: "LANG1199"})
                break
            case 'fewestcalls':
                strategy = formatMessage({id: "LANG1200"})
                break
            case 'random':
                strategy = formatMessage({id: "LANG1201"})
                break
            case 'rrmemory':
                strategy = formatMessage({id: "LANG1202"})
                break
            default:
                strategy = ''
                break
        }

        return strategy
    }
    _switchboard = () => {
        browserHistory.push('/call-features/callQueue/switchboard')
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const columns = [{
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG85"}),
                sorter: (a, b) => a.extension - b.extension
            }, {
                key: 'queue_name',
                dataIndex: 'queue_name',
                title: formatMessage({id: "LANG135"}),
                sorter: (a, b) => a.queue_name.length - b.queue_name.length
            }, {
                key: 'strategy',
                dataIndex: 'strategy',
                title: formatMessage({id: "LANG1137"}),
                sorter: (a, b) => a.strategy.length - b.strategy.length,
                render: (text, record, index) => {
                    return this._strategy(text)
                }
            }, {
                key: 'queue_chairman',
                dataIndex: 'queue_chairman',
                title: formatMessage({id: "LANG5408"}),
                sorter: (a, b) => a.queue_chairman - b.queue_chairman
            }, {
                key: 'members',
                dataIndex: 'members',
                title: formatMessage({id: "LANG128"}),
                render: (text, record, index) => {
                    let members = text ? text.split(',') : []
                    let extgroupLabel = formatMessage({id: "LANG2714"})

                    members = members.map(function(value, index) {
                            const item = this.props.extgroupObj[value]

                            if (item) {
                                return extgroupLabel + "--" + item.group_name
                            } else {
                                return value
                            }
                        }.bind(this))

                    if (members.length <= 5) {
                        return <div>
                                {
                                    members.map(function(value, index) {
                                        return <Tag key={ value }>{ value }</Tag>
                                    }.bind(this))
                                }
                            </div>
                    } else {
                        const content = <div>
                                    {
                                        members.map(function(value, index) {
                                            if (index >= 4) {
                                                return <Tag key={ value }>{ value }</Tag>
                                            }
                                        }.bind(this))
                                    }
                                </div>

                        return <div>
                                {
                                    [0, 1, 2, 3].map(function(value, index) {
                                        return <Tag key={ members[value] }>{ members[value] }</Tag>
                                    }.bind(this))
                                }
                                <Popover
                                    title=""
                                    content={ content }
                                >
                                    <Badge
                                        overflowCount={ 10 }
                                        count={ members.length - 4 }
                                    />
                                </Popover>
                            </div>
                    }
                }
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                onClick={ this._edit.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._delete.bind(this, record) }
                            >
                                <span className="sprite sprite-del"></span>
                            </Popconfirm>
                        </div>
                }
            }]

        const pagination = {
                showSizeChanger: false,
                total: this.props.callQueueList.length,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                },
                showTotal: (total) => {
                    return formatMessage({ id: "LANG115" }) + total
                }
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG607"})
                })

        return (
            <div className="app-content-main">
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._add }
                        >
                            { formatMessage({id: "LANG769"}) }
                        </Button>
                        <Button
                            icon="bar-chart"
                            type="primary"
                            size='default'
                            onClick={ this._statistics }
                            disabled={ !this.props.callQueueList.length }
                        >
                            { formatMessage({id: "LANG5359"}) }
                        </Button>
                        <Button
                            icon="phone"
                            type="primary"
                            size='default'
                            onClick={ this._switchboard }
                            disabled={ !this.props.callQueueList.length }
                        >
                            { formatMessage({id: "LANG5407"}) }
                        </Button>
                        <Button
                            icon="setting"
                            type="primary"
                            size='default'
                            onClick={ this._settings }
                        >
                            { formatMessage({id: "LANG748"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="extension"
                        columns={ columns }
                        pagination={ pagination }
                        dataSource={ this.props.callQueueList }
                        showHeader={ !!this.props.callQueueList.length }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(Queue)

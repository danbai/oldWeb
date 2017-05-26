'use strict'

import $ from 'jquery'
import React, { Component, PropTypes } from 'react'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { injectIntl } from 'react-intl'
import { Form, Input, Button, Modal, Row, Col, Checkbox, message, Upload, Icon, Select, Table, Popconfirm } from 'antd'
const FormItem = Form.Item
import _ from 'underscore'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'

const Option = Select.Option
const confirm = Modal.confirm
const baseServerURl = api.apiHost
const addZero = UCMGUI.addZero

class UserVoicemail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fileList: [],
            selectedRowKeys: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            fileName: "",
            selectedRows: [],
            download_visible: false,
            initPackName: ''
        }
    }
    componentDidMount() {
        this._listVoicemailFile()
    }

    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _showModal = (type, record) => {
        if (typeof record !== "undefined") {
            this.setState({
                visible: true,
                type: type,
                fileName: record.n
            })
        } else {
            this.setState({
                visible: true,
                type: type
            })   
        }
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: [],
            selectedRows: []
        })
    }
    _update = () => {
        browserHistory.push('/user-personal-data/userVoicemail/update')
    }
    _checkFileErrorHandler = (data) => {
        var response = data.response || {},
            result = response.result

        if (typeof result === 'number') {
        } else {
        }
    }
    _playRecord = (record) => {
        let filename = record.n
        let type = "INBOX"
        if (record.type === "INBOX") {
            type = "voicemails_dir"
        } else if (record.type === "Old") {
            type = "old_voicemails_dir"
        } else if (record.type === "Urgent") {
            type = "urgent_voicemails_dir"
        }

        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                "action": "checkFile",
                "type": type,
                "data": filename
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    window.location = "/cgi?action=playFile&type=" + type + "&data=" +
                                        encodeURIComponent(filename) + "&_=" + (new Date().getTime())
                } else {
                    this._checkFileErrorHandler(data)
                }
            }.bind(this)
        })
    }
    _delete = (record) => {
        const { formatMessage } = this.props.intl

        let fileName = record.n
        let type = "INBOX"
        if (record.type === "INBOX") {
            type = "voicemails_dir"
        } else if (record.type === "Old") {
            type = "old_voicemails_dir"
        } else if (record.type === "Urgent") {
            type = "urgent_voicemails_dir"
        }

        let action = {
            action: "removeFile",
            type: type,
            data: fileName
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>)

                    this._listVoicemailFile()
                }
            }.bind(this)
        })
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _listVoicemailFile = (
        params = {
            item_num: 10,
            sidx: 'type',
            sord: 'desc',
            page: 1
        }
        ) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listFile',
                type: 'voicemails',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["mp3", "wav"]}',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const fileList = response.voicemails || []
                    const pagination = this.state.pagination
                    // Read total count from server
                    pagination.total = response.total_item

                    fileList.map((item, i) => {
                        fileList[i]["key"] = item.type + item.n
                    })

                    this.setState({
                        loading: false,
                        fileList: fileList,
                        pagination: pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _download = (record) => {
        const { formatMessage } = this.props.intl

        let filename = record.n
        let type = "INBOX"
        if (record.type === "INBOX") {
            type = "voicemails_dir"
        } else if (record.type === "Old") {
            type = "old_voicemails_dir"
        } else if (record.type === "Urgent") {
            type = "urgent_voicemails_dir"
        }

        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                "action": "checkFile",
                "type": type,
                "data": filename // 1005-1.gsm
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    window.open("/cgi?action=downloadFile&type=" + type + "&data=" + encodeURIComponent(filename), '_self')
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })
    }

    _deleteSelectOk = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

        message.loading(loadingMessage)

        let filelist = []
        let key = "local"
        this.state.selectedRows.map((item, index) => {
            key = item.key
            if (key !== 'local') {
                filelist.push(item.key + '/' + item.n)
            } else {
                filelist.push(item.n)
            }
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: "removeFile",
                type: "batch_backup_package",
                data: filelist.join("\t")
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)
                    this._listVoicemailFile()
                    this._clearSelectRows()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _deleteSelect = (record) => {
        const { formatMessage } = this.props.intl
        const __this = this

        if (this.state.selectedRowKeys.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG2913"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG818"}, {0: this.state.selectedRowKeys.join('  ')})}} ></span>,
                onOk() {
                    __this._deleteSelectOk(record)
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _handleTableChange = (pagination, filters, sorter) => {
        const pager = this.state.pagination

        pager.current = pagination.current

        this.setState({
            pagination: pager
        })

        this._listVoicemailFile({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter.field ? sorter.field : 'type',
            sord: sorter.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        this.setState({
            selectedRowKeys: selectedRowKeys
        })
    }
   _voicemailType = (text, record, index) => {
        let value
        const { formatMessage } = this.props.intl

        if (text === 'INBOX') {
            value = <span>{ formatMessage({ id: "LANG5590" }) }</span>
        } else if (text === 'Old') {
            value = <span>{ formatMessage({ id: "LANG5591" }) }</span>
        } else if (text === 'Urgent') {
            value = <span>{ formatMessage({ id: "LANG5589" }) }</span>
        } else {
            value = <span>{ formatMessage({ id: "LANG5590" }) }</span>
        }
        return value
    }
    _tranSize = (cellvalue, options, rowObject) => {
        var size = parseFloat(cellvalue),
            rank = 0,
            rankchar = 'Bytes'

        while (size > 1024) {
            size = size / 1024
            rank++
        }

        if (rank === 1) {
            rankchar = "KB"
        } else if (rank === 2) {
            rankchar = "MB"
        } else if (rank === 3) {
            rankchar = "GB"
        }

        return (Math.round(size * Math.pow(10, 2)) / Math.pow(10, 2) + " " + rankchar)
    }

    _createOptions = (text, record, index) => {
        const { formatMessage } = this.props.intl

        return <div>
                    <span
                        className="sprite sprite-download"
                        title={ formatMessage({id: "LANG759"}) }
                        onClick={ this._download.bind(this, record) }>
                    </span>
                    <Popconfirm
                        title={ formatMessage({id: "LANG841"}) }
                        okText={ formatMessage({id: "LANG727"}) }
                        cancelText={ formatMessage({id: "LANG726"}) }
                        onConfirm={ this._delete.bind(this, record) }
                    >
                        <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                    </Popconfirm>
                </div>
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'key',
                dataIndex: 'key',
                className: 'hidden'
            }, {
                key: 'type',
                dataIndex: 'type',
                title: formatMessage({id: "LANG135"}),
                sorter: (a, b) => a.n - b.n,
                render: (text, record, index) => (
                    this._voicemailType(text, record, index)
                )
            }, {
                key: 'callerid',
                dataIndex: 'callerid',
                title: formatMessage({id: "LANG1067"}),
                sorter: (a, b) => a.n - b.n
            }, {
                key: 'd',
                dataIndex: 'd',
                title: formatMessage({id: "LANG203"}),
                sorter: (a, b) => a.n - b.n
            }, {
                key: 's',
                dataIndex: 's',
                title: formatMessage({id: "LANG2257"}),
                sorter: (a, b) => a.n - b.n,
                render: (text, record, index) => {
                    return (<span>{ this._tranSize(text) }</span>)
                }
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => (
                    this._createOptions(text, record, index)
                )
            }]

        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG20"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG20"}) }
                    isDisplay='hidden'
                />
                <div className="content">
                    <div className="top-button">
                        <Button
                            type="primary"
                            size='default'
                            onClick={ this._update }
                        >
                            { formatMessage({id: "LANG4722"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="key"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        dataSource={ this.state.fileList }
                        showHeader={ !!this.state.fileList.length }
                        onChange={ this._handleTableChange }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(UserVoicemail)

'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table } from 'antd'

const confirm = Modal.confirm

class Recording extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // selectedRows: [],
            // recordingFiles: [],
            selectedRowKeys: []
        }
    }
    componentDidMount () {
        // this._getRecordingFiles()
    }
    _delete = (fileName) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "checkFile",
                "type": "queue_recording",
                "data": fileName
            },
            type: 'json',
            async: true,
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    $.ajax({
                        url: api.apiHost,
                        method: 'post',
                        data: {
                            "action": "removeFile",
                            "type": "queue_recording",
                            "data": fileName
                        },
                        type: 'json',
                        async: true,
                        success: function(res) {
                            const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(successMessage)

                                this.props.refreshRecordingFiles()

                                this.setState({
                                    selectedRowKeys: _.without(this.state.selectedRowKeys, fileName)
                                })
                            }
                        }.bind(this),
                        error: function(e) {
                            message.error(e.statusText)
                        }
                    })
                } else {
                    message.error(formatMessage({id: "LANG3868"}))
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _deleteAll = () => {
        let __this = this
        let modalContent = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        modalContent = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG840"})}}></span>
        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

        confirm({
            content: modalContent,
            onOk() {
                message.loading(loadingMessage)

                $.ajax({
                    url: api.apiHost,
                    method: 'post',
                    data: {
                        "data": '*',
                        "action": "removeFile",
                        "type": "queue_recording"
                    },
                    type: 'json',
                    async: true,
                    success: function(res) {
                        const bool = UCMGUI.errorHandler(res, null, __this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            __this.props.refreshRecordingFiles()

                            __this.setState({
                                selectedRowKeys: []
                            })
                        }
                    },
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            },
            onCancel() {}
        })
    }
    _deleteBatch = () => {
        let __this = this
        let modalContent = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        modalContent = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG3512"})}}></span>
        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

        confirm({
            content: modalContent,
            onOk() {
                message.loading(loadingMessage)

                $.ajax({
                    url: api.apiHost,
                    method: 'post',
                    data: {
                        "action": "removeFile",
                        "type": "queue_recording",
                        "data": __this.state.selectedRowKeys.join(",,")
                    },
                    type: 'json',
                    async: true,
                    success: function(res) {
                        const bool = UCMGUI.errorHandler(res, null, __this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            __this.props.refreshRecordingFiles()

                            __this.setState({
                                selectedRowKeys: []
                            })
                        }
                    },
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            },
            onCancel() {}
        })
    }
    _download = (fileName) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "checkFile",
                "type": "queue_recording",
                "data": fileName
            },
            type: 'json',
            async: true,
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    window.open("/cgi?action=downloadFile&type=queue_recording&data=" + fileName, '_self')
                } else {
                    message.error(formatMessage({id: "LANG3868"}))
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _downloadAll = () => {
        const actionType = 'queue_pack'
        const { formatMessage } = this.props.intl
        const packingText = formatMessage({id: "LANG5391"})

        message.loading(packingText)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                'type': actionType,
                'action': 'packFile',
                'data': 'allQueueRecordFiles.tgz'
            },
            type: 'json',
            async: true,
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    window.open("/cgi?action=downloadFile&type=" + actionType + "&data=allQueueRecordFiles.tgz", '_self')

                    message.destroy()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _downloadBatch = () => {
        const actionType = 'queue_pack'
        const { formatMessage } = this.props.intl
        const packingText = formatMessage({id: "LANG5391"})

        message.loading(packingText)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                'type': actionType,
                'action': 'packFile',
                'data': this.state.selectedRowKeys.join(',')
            },
            type: 'json',
            async: true,
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    window.open("/cgi?action=downloadFile&type=" + actionType + "&data=batchQueueRecordFiles.tgz", '_self')

                    message.destroy()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getRecordingFiles = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                sidx: 'd',
                sord: 'desc',
                action: 'listFile',
                "type": "queue_recording",
                "filter": '{"list_dir":0, "list_file":1, "file_suffix": ["mp3", "wav"]}'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const recordingFiles = response.queue_recording || []

                    this.setState({
                        recordingFiles: recordingFiles
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
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'n',
                dataIndex: 'n',
                title: formatMessage({id: "LANG135"}),
                sorter: (a, b) => a.n.length - b.n.length
            }, {
                key: 'caller',
                dataIndex: 'caller',
                title: formatMessage({id: "LANG2646"}),
                sorter: (a, b) => a.caller.length - b.caller.length
            }, {
                key: 'queue',
                dataIndex: 'queue',
                title: formatMessage({id: "LANG607"}),
                sorter: (a, b) => a.queue.length - b.queue.length
            }, {
                key: 'd',
                dataIndex: 'd',
                title: formatMessage({id: "LANG203"}),
                sorter: (a, b) => a.d.length - b.d.length
            }, {
                key: 's',
                dataIndex: 's',
                title: formatMessage({id: "LANG2257"}),
                sorter: (a, b) => a.s - b.s,
                render: (text, record, index) => {
                    return this._tranSize(text)
                }
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
                                onConfirm={ this._delete.bind(this, record.n) }
                            >
                                <span className="sprite sprite-del"></span>
                            </Popconfirm>
                            <span
                                className="sprite sprite-download"
                                onClick={ this._download.bind(this, record.n) }>
                            </span>
                        </div>
                }
            }]
        const pagination = {
                total: this.props.recordingFiles.length,
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
                    1: formatMessage({id: "LANG2731"})
                })

        return (
            <div className="app-content-main">
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="download"
                            type="primary"
                            size='default'
                            onClick={ this._downloadBatch }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG759"}) }
                        </Button>
                        <Button
                            icon="download"
                            type="primary"
                            size='default'
                            onClick={ this._downloadAll }
                            disabled={ !this.props.recordingFiles.length }
                        >
                            { formatMessage({id: "LANG741"}, {0: ''}) }
                        </Button>
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._deleteBatch }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG739"}) }
                        </Button>
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._deleteAll }
                            disabled={ !this.props.recordingFiles.length }
                        >
                            { formatMessage({id: "LANG740"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="n"
                        columns={ columns }
                        pagination={ pagination }
                        rowSelection={ rowSelection }
                        dataSource={ this.props.recordingFiles }
                        showHeader={ !!this.props.recordingFiles.length }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(Recording)
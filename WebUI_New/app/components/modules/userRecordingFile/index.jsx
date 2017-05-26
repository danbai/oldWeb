'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag } from 'antd'

class UserCdrRecord extends Component {
    constructor(props) {
        super(props)
        this.state = {
            cdrRecord: [],
            selectedRowKeys: []
        }
    }
    componentDidMount() {
        this._getCdrRecord()
    }
    _getCdrRecord = () => {
        const { formatMessage } = this.props.intl
        let cdrRecord = []
        let en_rm_voice_recording = ''

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getCustomPrivilege',
                privilege_id: '3'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    en_rm_voice_recording = response.privilege_id.en_rm_voice_recording
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
                action: 'listFile',
                type: 'voice_recording',
                filter: '{"list_dir":0, "list_file":1, "file_suffix": ["mp3", "wav"]}',
                sidx: 'd',
                sord: 'desc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    cdrRecord = response.voice_recording || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            en_rm_voice_recording: en_rm_voice_recording,
            cdrRecord: cdrRecord
        })
    }
    _delete = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        let fileName = record.n
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "checkFile",
                "type": "voice_recording",
                "data": fileName
            },
            type: 'json',
            async: true,
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    message.loading(loadingMessage, 0)

                    $.ajax({
                        url: api.apiHost,
                        method: 'post',
                        data: {
                            "action": "removeFile",
                            "type": "voice_recording",
                            "data": fileName
                        },
                        type: 'json',
                        async: true,
                        success: function(res) {
                            const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(successMessage)

                                this._getCdrRecord()
                                this._clearSelectRows()
                            }
                        }.bind(this),
                        error: function(e) {
                            message.error(e.statusText)
                        }
                    })
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _download = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        let fileName = record.n
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG961" })}}></span>

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "checkFile",
                "type": "voice_recording",
                "data": fileName
            },
            type: 'json',
            async: true,
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    message.loading(loadingMessage, 0)
                    window.open("/cgi?action=downloadFile&type=voice_recording&data=" + fileName, '_self')
                    message.destroy()
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _play = (record) => {
        const { formatMessage } = this.props.intl

        let fileName = record.n,
            type = 'voice_recording'

        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                "action": "checkFile",
                "type": type,
                "data": fileName
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    window.location = "/cgi?action=playFile&type=" + type + "&data=" +
                                        encodeURIComponent(fileName) + "&_=" + (new Date().getTime())
                } else {
                    if (data.status === -11) {
                        message.error(formatMessage({id: "LANG3466"}))
                    } else if (data.status === 2) {
                        message.error(formatMessage({ id: "LANG3868" }))
                    } else {
                        this._checkFileErrorHandler(data)
                    }
                }
            }.bind(this)
        })
    }
    _checkFileErrorHandler = (data) => {
        var response = data.response || {},
            result = response.result

        if (typeof result === 'number') {
            UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)
        } else {
        }
    }
    _batchDownload = () => {
        let selectedRowKeys = this.state.selectedRowKeys
        let actionType = 'cdr_pack'
        const { formatMessage } = this.props.intl

        if (this.state.cdrRecord.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG2240"})
            })

            return
        }

        if (selectedRowKeys.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG4762"}, {0: formatMessage({ id: "LANG3652" })})
            })

            return
        }

        let loadingMessage = ''

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG5391" })}}></span>

        message.loading(loadingMessage, 0)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "packFile",
                "type": actionType,
                "data": selectedRowKeys.join(',')
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    window.open("/cgi?action=downloadFile&type=" + actionType + "&data=batchCdrRecordFiles.tgz", '_self')

                    this._clearSelectRows()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _downloadAll = () => {
        let actionType = 'cdr_pack'
        let allFileList = []
        const { formatMessage } = this.props.intl

        if (this.state.cdrRecord.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG2240"})
            })

            return
        }

        console.log('----cdr-', this.state.cdrRecord)
        this.state.cdrRecord.map(function(item) {
            let filename = item.n
            allFileList.push(filename)
        })

        let loadingMessage = ''

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG5391" })}}></span>

        message.loading(loadingMessage, 0)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "packFile",
                "type": actionType,
                "data": allFileList.join(',')
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    window.open("/cgi?action=downloadFile&type=" + actionType + "&data=batchCdrRecordFiles.tgz", '_self')
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _createSize = (text) => {
        let size = parseFloat(text),
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

        return Math.round(size * Math.pow(10, 2)) / Math.pow(10, 2) + " " + rankchar
    }
    _createOptions = (record) => {
        const { formatMessage } = this.props.intl
        const en_rm_voice_recording = this.state.en_rm_voice_recording
        if (en_rm_voice_recording === 'no') {
            return (
                <div>
                    <span title={ formatMessage({id: "LANG777"}) } className="sprite sprite-play" onClick={ this._play.bind(this, record) }></span>
                    <span title={ formatMessage({id: "LANG759"}) } className="sprite sprite-download" onClick={ this._download.bind(this, record) }></span>
                    <span title={ formatMessage({id: "LANG2471"}) } className="sprite sprite-del-disabled" ></span>
                </div>
            )
        } else {
            return (
                <div>
                    <span title={ formatMessage({id: "LANG777"}) } className="sprite sprite-play" onClick={ this._play.bind(this, record) }></span>
                    <span title={ formatMessage({id: "LANG759"}) } className="sprite sprite-download" onClick={ this._download.bind(this, record) }></span>
                    <Popconfirm
                        title={ formatMessage({id: "LANG841"}) }
                        okText={ formatMessage({id: "LANG727"}) }
                        cancelText={ formatMessage({id: "LANG726"}) }
                        onConfirm={ this._delete.bind(this, record) }
                    >
                        <span title={ formatMessage({id: "LANG2471"}) } className="sprite sprite-del" ></span>
                    </Popconfirm>
                </div>
            )
        }
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ selectedRowKeys, selectedRows })
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRows: [],
            selectedRowKeys: []
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'caller',
                dataIndex: 'caller',
                title: formatMessage({id: "LANG2646"})
            }, {
                key: 'callee',
                dataIndex: 'callee',
                title: formatMessage({id: "LANG2647"})
            }, {
                key: 'd',
                dataIndex: 'd',
                title: formatMessage({id: "LANG2645"})
            }, {
                key: 's',
                dataIndex: 's',
                title: formatMessage({id: "LANG2257"}),
                render: (text, record, index) => {
                    return this._createSize(text)
                }
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return this._createOptions(record)
                }
            }]
        const pagination = {
                total: this.state.cdrRecord.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)

                    this._clearSelectRows()
                },
                onChange: (current) => {
                    console.log('Current: ', current)

                    this._clearSelectRows()
                }
            }
        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG2241"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG2640"}) }
                    isDisplay='hidden'
                />
                <div className="content">
                    { /*
                    <div className="top-button">
                        <Button
                            type="primary"
                            size='default'
                            onClick={ this._downloadAll }
                        >
                            { formatMessage({id: "LANG5589"}) }
                        </Button>
                        <Button
                            type="primary"
                            size='default'
                            onClick={ this._batchDownload }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG759"}) }
                        </Button>
                    </div>
                    */ }
                    <Table
                        rowKey="n"
                        columns={ columns }
                        pagination={ pagination }
                        // rowSelection={ rowSelection }
                        dataSource={ this.state.cdrRecord }
                        showHeader={ !!this.state.cdrRecord.length }/>
                </div>
            </div>
        )
    }
}

export default injectIntl(UserCdrRecord)
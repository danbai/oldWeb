'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Form, Input, Icon, Table, Button, message, Modal, Popconfirm } from 'antd'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"

let subCDRList = []

class CDRList extends Component {
    constructor(props) {
        let privilege = localStorage.getItem('role')

        super(props)

        this.state = {
            visible: false,
            recordFiles: [],
            userPortalBtn: privilege === 'privilege_3',
            userAdmin: privilege === 'privilege_0'
        }
    }
    _getSubCDR = (session) => {
        $.ajax({
            async: false,
            type: 'post',
            url: api.apiHost,
            dataType: 'json',
            data: {
                'action': 'getSubCDR',
                'session': session
            },
            success: function(res) {
                subCDRList = res.response.sub_cdr || []
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _sendDownloadRequest = () => {
        const { formatMessage } = this.props.intl

        message.loading(formatMessage({ id: "LANG3774" }))

        $.ajax({
            type: "GET",
            url: "/cgi?action=reloadCDRRecordFile&reflush_Record=all",
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()

                    window.open("/cgi?action=downloadFile&type=cdr_recording&data=Master.csv&_location=cdr&_=" + (new Date().getTime()), '_self')
                }
            }.bind(this)
        })
    }
    _showRecordFile = (list) => {
        this.setState({
            visible: true,
            recordFiles: list
        })
    }
    _hideRecordFile = () => {
        this.setState({
            visible: false
        })
    }
    _autoDownloadSettings = () => {
        browserHistory.push('/cdr/cdr/autoDownload')
    }
    _createStatus = (text, record, index) => {
        const {formatMessage} = this.props.intl

        let status

        if (text.indexOf("ANSWERED") > -1) {
            status = <span className="sprite sprite-cdr-answer" title={ formatMessage({ id: "LANG4863" }) }></span>
        } else if (text.indexOf("NO ANSWER") > -1) {
            status = <span className="sprite sprite-cdr-no-answer" title={ formatMessage({ id: "LANG4864" }) }></span>
        } else if (text.indexOf("FAILED") > -1) {
            status = <span className="sprite sprite-cdr-fail" title={ formatMessage({ id: "LANG2405" }) }></span>
        } else if (text.indexOf("BUSY") > -1) {
            status = <span className="sprite sprite-cdr-busy" title={ formatMessage({ id: "LANG2237" }) }></span>
        }

        return status
    }
    _createTalkTime = (text, record, index) => {
        let s = parseInt(text, 10),
            h = Math.floor(s / 3600)

        s = s % 3600

        let m = Math.floor(s / 60)

        s = s % 60

        return h + ":" + (m < 10 ? ("0" + m) : m) + ":" + (s < 10 ? ("0" + s) : s)
    }
    _createRecordFile = (text, record, index) => {
        const {formatMessage} = this.props.intl

        let record_list = text,
            options = ''

        if (record_list.length > 0) {
            let list = record_list.split('@')

            list.pop()

            options = <div>
                        <span className="sprite sprite-cdr-record" onClick={ this._showRecordFile.bind(this, list) }></span>
                        <span className="record-num">{ list.length }</span>
                      </div>
        } else {
            options = '-'
        }

        return options
    }
    _checkFileErrorHandler = (data) => {
        var response = data.response || {},
            result = response.result

        if (typeof result === 'number') {
        } else {
        }
    }
    _playRecord = (value) => {
        var filename = value,
            type

        if (filename.indexOf("auto-") > -1) {
            type = 'voice_recording'
        } else {
            type = 'conference_recording'
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
                    window.location = "/cgi?action=playFile&type=" + type + "&data=" + encodeURIComponent(filename) + "&_=" + (new Date().getTime())
                } else {
                    this._checkFileErrorHandler(data)
                }
            }.bind(this)
        })
    }
    _downloadRecord = (value) => {
        var file = value, 
            type

        if (file.indexOf("auto-") > -1) {
            type = 'voice_recording'
        } else {
            type = 'conference_recording'
        }

        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                "action": "checkFile",
                "type": type,
                "data": file
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    top.window.open("/cgi?action=downloadFile&type=" + type + "&data=" + encodeURIComponent(file) + "&_=" + (new Date().getTime()), '_self')
                } else {
                    this._checkFileErrorHandler(data)
                }
            }.bind(this)
        })
    }
    _deleteRecord = (value, index) => {
        const { formatMessage } = this.props.intl

        let file = value, 
            type

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage, 0)

        if (file.indexOf("auto-") > -1) {
            type = 'voice_recording'
        } else {
            type = 'conference_recording'
        }

        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                "action": "removeFile",
                "type": type,
                "data": file
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    let recordFiles = this.state.recordFiles

                    recordFiles.splice(index, 1)

                    this.setState({
                        recordFiles: recordFiles
                    })

                    this.props.getCdrData()
                }
            }.bind(this)
        })
    }
    _transSrc = (text, record, index) => {
        var content = ''

        if (record['caller_name']) {
            content += '"' + record['caller_name'] + '" '
        }

        if (record['src']) {
            content += record['src'] + ' '
        }

        if (record['src_trunk_name']) {
            content += '[Trunk: ' + record['src_trunk_name'] + ']'
        }

        return content
    }
    _transDst = (text, record, index) => {
        var content = ''

        if (record['dst']) {
            content += record['dst'] + ' '
        }

        if (record['dst_trunk_name']) {
            content += '[Trunk: ' + record['dst_trunk_name'] + ']'
        }

        return content
    }
    render() {
        const {formatMessage} = this.props.intl

        const columns = [
            {
                title: formatMessage({id: "LANG186"}),
                dataIndex: 'disposition',
                render: (text, record, index) => (
                    this._createStatus(text, record, index)
                ),
                sorter: true
            }, {
                title: formatMessage({id: "LANG581"}),
                dataIndex: 'src',
                render: (text, record, index) => (
                    this._transSrc(text, record, index)
                ),
                sorter: true,
                width: '15%'
            }, {
                title: formatMessage({id: "LANG582"}),
                dataIndex: 'dst',
                render: (text, record, index) => (
                    this._transDst(text, record, index)
                ),
                sorter: true,
                width: '15%'
            }, {
                title: formatMessage({id: "LANG5134"}),
                dataIndex: 'action_type',
                sorter: true,
                width: '15%'
            }, {
                title: formatMessage({id: "LANG169"}),
                dataIndex: 'start',
                sorter: true
            }, {
                title: formatMessage({id: "LANG2238"}),
                dataIndex: 'billsec',
                render: (text, record, index) => (
                    this._createTalkTime(text, record, index)
                ),
                sorter: true
            }, {
                title: formatMessage({id: "LANG4569"}),
                dataIndex: 'accountcode',
                sorter: true
            }, {
                title: formatMessage({id: "LANG4096"}),
                dataIndex: 'recordfiles',
                render: (text, record, index) => (
                    this._createRecordFile(text, record, index)
                ),
                sorter: true
            }
        ]

        const expandedRowRender = (e) => {
            const columns = [
                {
                    title: formatMessage({id: "LANG186"}),
                    dataIndex: 'disposition',
                    render: (text, record, index) => (
                        this._createStatus(text, record, index)
                    )
                }, {
                    title: formatMessage({id: "LANG581"}),
                    dataIndex: 'src',
                    render: (text, record, index) => (
                        this._transSrc(text, record, index)
                    ),
                    width: '15%'
                }, {
                    title: formatMessage({id: "LANG582"}),
                    dataIndex: 'dst',
                    render: (text, record, index) => (
                        this._transDst(text, record, index)
                    ),
                    width: '15%'
                }, {
                    title: formatMessage({id: "LANG5134"}),
                    dataIndex: 'action_type',
                    width: '15%'
                }, {
                    title: formatMessage({id: "LANG169"}),
                    dataIndex: 'start'
                }, {
                    title: formatMessage({id: "LANG2238"}),
                    dataIndex: 'billsec',
                    render: (text, record, index) => (
                        this._createTalkTime(text, record, index)
                    )
                }, {
                    title: formatMessage({id: "LANG4569"}),
                    dataIndex: 'accountcode'
                }, {
                    title: formatMessage({id: "LANG4096"}),
                    dataIndex: 'recordfiles',
                    render: (text, record, index) => (
                        this._createRecordFile(text, record, index)
                    )
                }
            ]

            this._getSubCDR(e.session)

            return (
                <Table
                    columns={ columns }
                    dataSource={ subCDRList }
                    pagination={ false } />
            )
        }

        return (
            <div>
                <div className="top-button">
                    <Button
                        type="primary"
                        icon="delete"
                        size='default'
                        onClick={ this.props.deleteAll }
                        className={ this.state.userPortalBtn ? 'hidden' : '' }
                    >
                        { formatMessage({id: "LANG740"}) }
                    </Button>
                    <Button
                        type="primary"
                        icon="download"
                        size='default'
                        onClick={ this._sendDownloadRequest }
                        className={ this.state.userPortalBtn ? 'hidden' : '' }
                    >
                        { formatMessage({id: "LANG741" }, { 0: formatMessage({id: "LANG4146"})}) }
                    </Button>
                    <Button
                        type="primary"
                        icon="download"
                        size='default'
                        onClick={ this.props.sendDownloadSearchRequest }
                    >
                        { formatMessage({id: "LANG3699" })}
                    </Button>
                    <Button
                        type="primary"
                        icon="setting"
                        size='default'
                        onClick={ this._autoDownloadSettings }
                        className={ this.state.userAdmin ? '' : 'hidden' }
                    >
                        { formatMessage({id: "LANG3955" })}
                    </Button>
                </div>
                <Table
                    columns={ columns }
                    rowKey={ record => record.session }
                    dataSource={ this.props.cdrData }
                    pagination={ this.props.pagination }
                    expandedRowRender = { expandedRowRender }
                    onChange={ this.props.handleTableChange }
                    showHeader={ !!this.props.cdrData.length }
                />
                <Modal
                    footer={ false }
                    visible={ this.state.visible }
                    onCancel={ this._hideRecordFile }
                    title={ formatMessage({id: "LANG2640"}) }
                >
                    <div id="cdr-record">
                        { 
                            this.state.recordFiles.map(function(value, index) {
                                return <div className="record-list" key={ index }>
                                            <span className="sprite sprite-record"></span>
                                            <span className="record-item">{ value }</span>
                                            <div className="record-btn">
                                                <span
                                                    className="sprite sprite-play"
                                                    onClick={ this._playRecord.bind(this, value) }
                                                >
                                                </span>
                                                <span
                                                    className="sprite sprite-download"
                                                    onClick={ this._downloadRecord.bind(this, value) }
                                                >
                                                </span>
                                                <Popconfirm
                                                    title={ formatMessage({id: "LANG841"}) }
                                                    okText={ formatMessage({id: "LANG727"}) }
                                                    cancelText={ formatMessage({id: "LANG726"}) }
                                                    onConfirm={ this._deleteRecord.bind(this, value, index) }
                                                >
                                                    <span className="sprite sprite-del"></span>
                                                </Popconfirm>
                                            </div>
                                       </div>
                            }.bind(this))
                        }
                    </div>
                </Modal>
            </div>
        )
    }
}

export default injectIntl(CDRList)
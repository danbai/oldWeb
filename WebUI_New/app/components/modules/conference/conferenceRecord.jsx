'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Alert, Button, message, Modal, Popconfirm, Table, Tag } from 'antd'

const confirm = Modal.confirm

class ConferenceRecord extends Component {
    constructor(props) {
        super(props)

        this.state = {
            lastLink: [],
            store_msg: '',
            firstload: true,
            selectedRowKeys: [],
            conferenceRecord: [],
            interfaceStatusVisible: false
        }
    }
    componentDidMount() {
        this.props.getInterfaceStatus()
    }
    componentWillUnmount() {
    }
    componentWillReceiveProps(nextProps) {
        const { formatMessage } = this.props.intl

        let interfaceStatus = nextProps.interfaceStatus || {},
            sdcard_info = interfaceStatus['interface-sdcard'],
            usbdisk_info = interfaceStatus['interface-usbdisk'],
            link_info = '',
            store_msg = ''

        if (!_.isEmpty(interfaceStatus) && nextProps.activeKey === '4') {
            if (sdcard_info === 'true' || usbdisk_info === 'true') {
                $.ajax({
                    type: 'post',
                    async: false,
                    url: api.apiHost,
                    data: {
                        'action': 'getRecordingLink',
                        'auto-refresh': Math.random()
                    },
                    success: function(res) {
                        const bool = UCMGUI.errorHandler(res, null, formatMessage)

                        if (bool) {
                            link_info = res.response['body']

                            if (link_info === 'local') {
                                store_msg = 'LANG1072'
                            } else if (link_info === 'USB') {
                                store_msg = 'LANG263'
                            } else if (link_info === 'SD') {
                                store_msg = 'LANG262'
                            }

                            this.setState({
                                store_msg: store_msg,
                                interfaceStatusVisible: true
                            })
                        }
                    }.bind(this),
                    error: function(e) {
                        message.destroy()
                        message.error(formatMessage({id: "LANG913"}))
                    }
                })
            } else {
                $.ajax({
                    type: 'post',
                    async: false,
                    url: api.apiHost,
                    data: {
                        'action': 'getRecordingLink',
                        'auto-refresh': Math.random()
                    },
                    success: function(res) {
                        const bool = UCMGUI.errorHandler(res, null, formatMessage)

                        if (bool) {
                            link_info = res.response['body']

                            this.setState({
                                store_msg: store_msg,
                                interfaceStatusVisible: false
                            })

                            if (link_info !== 'local') {
                                $.ajax({
                                    type: 'post',
                                    async: false,
                                    url: api.apiHost,
                                    data: {
                                        'choose_link': '0',
                                        'action': 'ChooseLink'
                                    },
                                    error: function(e) {
                                        message.destroy()
                                        message.error(formatMessage({id: "LANG913"}))
                                    },
                                    success: function(res) {
                                        const bool = UCMGUI.errorHandler(res, null, formatMessage)

                                        if (bool) {}
                                    }
                                })
                            }
                        }
                    }.bind(this),
                    error: function(e) {
                        message.destroy()
                        message.error(formatMessage({id: "LANG913"}))
                    }
                })
            }

            if (this.state.firstload) {
                this._getConferenceRecord()

                this.setState({
                    firstload: false,
                    lastLink: link_info
                })
            } else {
                if (this.state.lastLink !== link_info) {
                    let confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3867" })}}></span>

                    confirm({
                        content: confirmContent,
                        onOk: () => {
                            this._getConferenceRecord()

                            this.setState({
                                lastLink: link_info
                            })
                        },
                        onCancel: () => {
                            this.setState({
                                lastLink: link_info
                            })
                        }
                    })
                }
            }
        }
    }
    _jumpToRecordingStorage = () => {
        browserHistory.push('/pbx-settings/recordingStorageSettings')
    }
    _getConferenceRecord = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'post',
            async: false,
            dataType: 'json',
            url: api.apiHost,
            data: {
                action: 'listFile',
                type: 'conference_recording',
                filter: '{"list_dir":0, "list_file":1, "file_suffix": ["mp3", "wav"]}',
                sidx: 'd',
                sord: 'desc'
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = data.response || {}
                    const conferenceRecord = response.conference_recording || []

                    this.setState({
                        conferenceRecord: conferenceRecord
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _delete = (record) => {
        const { formatMessage } = this.props.intl

        let fileName = record.n
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage, 0)

        $.ajax({
            type: 'post',
            async: true,
            dataType: 'json',
            url: api.apiHost,
            data: {
                "action": "checkFile",
                "type": "conference_recording",
                "data": fileName
            },
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    $.ajax({
                        type: 'post',
                        async: true,
                        dataType: 'json',
                        url: api.apiHost,
                        data: {
                            "action": "removeFile",
                            "type": "conference_recording",
                            "data": fileName
                        },
                        success: function(data) {
                            const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(successMessage)

                                this._getConferenceRecord()
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
        const { formatMessage } = this.props.intl

        let fileName = record.n
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG961" })}}></span>

        message.loading(loadingMessage, 0)

        $.ajax({
            type: 'post',
            async: true,
            dataType: 'json',
            url: api.apiHost,
            data: {
                "action": "checkFile",
                "type": "conference_recording",
                "data": fileName
            },
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    message.destroy()

                    window.open("/cgi?action=downloadFile&type=conference_recording&data=" + fileName, '_self')
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _batchDelete = () => {
        const { formatMessage } = this.props.intl

        if (this.state.conferenceRecord.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG2240"})
            })

            return
        }

        let self = this
        let selectedRowKeys = self.state.selectedRowKeys

        if (selectedRowKeys.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG823"}, {0: formatMessage({ id: "LANG2640" })})
            })

            return
        }

        let confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3512" })}}></span>

        confirm({
            content: confirmContent,
            onOk() {
                let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
                let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

                message.loading(loadingMessage, 0)

                $.ajax({
                    type: 'post',
                    async: true,
                    dataType: 'json',
                    url: api.apiHost,
                    data: {
                        "action": "removeFile",
                        "type": "conference_recording",
                        "data": selectedRowKeys.join(',,')
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, self.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            self._getConferenceRecord()
                            self._clearSelectRows()
                        }
                    }.bind(this),
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            },
            onCancel() {}
        })
    }
    _batchDownload = () => {
        const { formatMessage } = this.props.intl

        if (this.state.conferenceRecord.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG2240"})
            })

            return
        }

        let actionType = 'meetme_pack'
        let selectedRowKeys = this.state.selectedRowKeys

        if (selectedRowKeys.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG4762"}, {0: formatMessage({ id: "LANG3652" })})
            })

            return
        }

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG5391" })}}></span>

        message.loading(loadingMessage, 0)

        $.ajax({
            type: 'post',
            async: true,
            dataType: 'json',
            url: api.apiHost,
            data: {
                "action": "packFile",
                "type": actionType,
                "data": selectedRowKeys.join(',')
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()

                    window.open("/cgi?action=downloadFile&type=" + actionType + "&data=batchMeetmeRecordFiles.tgz", '_self')

                    this._clearSelectRows()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _deleteAll = () => {
        const { formatMessage } = this.props.intl

        let self = this

        if (this.state.conferenceRecord.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG2240"})
            })

            return
        }

        let confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG840" })}}></span>

        confirm({
            content: confirmContent,
            onOk() {
                let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
                let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

                message.loading(loadingMessage, 0)

                $.ajax({
                    type: 'post',
                    async: true,
                    dataType: 'json',
                    url: api.apiHost,
                    data: {
                        "action": "removeFile",
                        "type": "conference_recording",
                        "data": '*'
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, self.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            self._getConferenceRecord()
                        }
                    }.bind(this),
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            },
            onCancel() {}
        })
    }
    _downloadAll = () => {
        const { formatMessage } = this.props.intl

        if (this.state.conferenceRecord.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG2240"})
            })

            return
        }

        let actionType = 'meetme_pack'
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG5391" })}}></span>

        message.loading(loadingMessage, 0)

        $.ajax({
            type: 'post',
            async: true,
            dataType: 'json',
            url: api.apiHost,
            data: {
                "action": "packFile",
                "type": actionType,
                "data": 'allMeetmeFiles.tgz'
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()

                    window.open("/cgi?action=downloadFile&type=" + actionType + "&data=allMeetmeFiles.tgz", '_self')
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

        return (
            <div>
                <Popconfirm
                    title={ formatMessage({id: "LANG841"}) }
                    okText={ formatMessage({id: "LANG727"}) }
                    cancelText={ formatMessage({id: "LANG726"}) }
                    onConfirm={ this._delete.bind(this, record) }
                >
                    <span className="sprite sprite-del"></span>
                </Popconfirm>
                <span className="sprite sprite-download" onClick={ this._download.bind(this, record) }></span>
            </div>
        )
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

        let htmlPrivilege = JSON.parse(localStorage.getItem('html_privilege'))
        let storagePrivilege = htmlPrivilege.recordingStorageSettings === 1

        let columns = [{
                key: 'n',
                dataIndex: 'n',
                title: formatMessage({id: "LANG135"}),
                sorter: (a, b) => a.group_name.length - b.group_name.length
            }, {
                key: 'room',
                dataIndex: 'room',
                title: formatMessage({id: "LANG1045"})
            }, {
                key: 'd',
                dataIndex: 'd',
                title: formatMessage({id: "LANG203"})
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

        let pagination = {
                total: this.state.conferenceRecord.length,
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

        let rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        let message = '',
            store_msg = this.state.store_msg

        if (store_msg) {
            message = <span
                            style={{ 'cursor': 'pointer' }}
                            onClick={ this._jumpToRecordingStorage.bind(this) }
                            dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3757" }, {
                                        0: `<span style="disabled: inline-block; color: #4c8eff; margin: 0 5px; cursor: pointer;">` + formatMessage({id: store_msg}) + `</span>`
                                    })
                                }}
                        ></span>
        }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG2241"})
                })

        return (
            <div className="app-content-main">
                <div className="content">
                    <Alert
                        type="warning"
                        message={ message }
                        className={ storagePrivilege && this.state.interfaceStatusVisible ? 'ant-alert-warning-custom' : 'hidden' }
                    />
                    <div className="top-button">
                        <Button
                            type="primary"
                            size='default'
                            onClick={ this._batchDelete }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG3488"}) }
                        </Button>
                        <Button
                            type="primary"
                            size='default'
                            onClick={ this._deleteAll }
                        >
                            { formatMessage({id: "LANG3439"}) }
                        </Button>
                        <Button
                            type="primary"
                            size='default'
                            onClick={ this._batchDownload }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG4761"}, {0: formatMessage({id: "LANG2640"})}) }
                        </Button>
                        <Button
                            type="primary"
                            size='default'
                            onClick={ this._downloadAll }
                        >
                            { formatMessage({id: "LANG741"}, {0: formatMessage({id: "LANG2640"})}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="n"
                        columns={ columns }
                        pagination={ pagination }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.conferenceRecord }
                        showHeader={ !!this.state.conferenceRecord.length }
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    interfaceStatus: state.interfaceStatus
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ConferenceRecord))
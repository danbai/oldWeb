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

class RecordingFile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            sorter: {},
            cdrRecord: [],
            lastLink: [],
            store_msg: '',
            loading: false,
            firstload: true,
            selectedRowKeys: [],
            interfaceStatusVisible: false,
            pagination: {
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: this._showTotal
            }
        }
    }
    componentDidMount() {
    }
    componentWillMount() {
        this.props.getInterfaceStatus()
    }
    componentWillReceiveProps(nextProps) {
        const { formatMessage } = this.props.intl

        let interfaceStatus = nextProps.interfaceStatus || {},
            sdcard_info = interfaceStatus['interface-sdcard'],
            usbdisk_info = interfaceStatus['interface-usbdisk'],
            link_info = '',
            store_msg = ''

        if (!_.isEmpty(interfaceStatus)) {
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
                this._getCdrRecord()

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
                            this._getCdrRecord()

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
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _getCdrRecord = (
        params = {                
                item_num: 10,
                sidx: "d",
                sord: "desc",
                page: 1 
            }
        ) => {
        const { formatMessage } = this.props.intl

        this.setState({loading: true})

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listFile',
                type: 'voice_recording',
                filter: '{"list_dir":0, "list_file":1, "file_suffix": ["mp3", "wav"]}',
                ...params
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const cdrRecord = response.voice_recording || []

                    const pagination = this.state.pagination

                    // Read total count from server
                    pagination.total = res.response.total_item

                    this.setState({
                        loading: false,
                        cdrRecord: cdrRecord,
                        pagination
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
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

        $.ajax({
            type: 'post',
            async: true,
            url: api.apiHost,
            data: {
                "action": "checkFile",
                "type": "voice_recording",
                "data": fileName
            },
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    message.loading(loadingMessage, 0)

                    $.ajax({
                        type: 'post',
                        async: true,
                        url: api.apiHost,
                        data: {
                            "data": fileName,
                            "action": "removeFile",
                            "type": "voice_recording"
                        },
                        success: function(res) {
                            const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(successMessage)

                                let pagination = this.state.pagination
                                let pageSize = pagination.pageSize
                                let current = pagination.current
                                let old_total = pagination.total

                                let new_total = old_total - 1
                                let new_total_page = (new_total - 1) / pageSize + 1

                                if (current > new_total_page) {
                                    current = Math.floor(new_total_page)
                                }

                                pagination.current = current

                                this._getCdrRecord({
                                    item_num: pageSize,
                                    page: current === 0 ? 1 : current,
                                    sidx: this.state.sorter.field ? this.state.sorter.field : 'd',
                                    sord: this.state.sorter.order === "ascend" ? "asc" : "desc"
                                })

                                this._clearSelectRows()

                                this.setState({
                                    pagination: pagination
                                })
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

        $.ajax({
            type: 'post',
            async: true,
            url: api.apiHost,
            data: {
                "action": "checkFile",
                "type": "voice_recording",
                "data": fileName
            },
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
                    window.location = "/cgi?action=playFile&type=" + type + "&data=" + encodeURIComponent(fileName) + "&_=" + (new Date().getTime())
                } else if (data.status === 2) {
                    message.error(formatMessage({ id: "LANG3868" }))
                } else {
                    this._checkFileErrorHandler(data)
                }
            }.bind(this)
        })
    }
    _checkFileErrorHandler = (data) => {
        var response = data.response || {},
            result = response.result

        if (typeof result === 'number') {
        } else {
        }
    }
    _batchDelete = () => {
        const { formatMessage } = this.props.intl

        let self = this
        let confirmContent = ''
        let selectedRowKeys = self.state.selectedRowKeys

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
                content: formatMessage({id: "LANG823"}, {0: formatMessage({ id: "LANG2640" })})
            })

            return
        }

        confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3512" })}}></span>

        confirm({
            content: confirmContent,
            onOk() {
                let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
                let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

                message.loading(loadingMessage, 0)

                $.ajax({
                    type: 'post',
                    async: true,
                    url: api.apiHost,
                    data: {
                        "action": "removeFile",
                        "type": "voice_recording",
                        "data": selectedRowKeys.join(',,')
                    },
                    success: function(res) {
                        const bool = UCMGUI.errorHandler(res, null, self.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            let pagination = self.state.pagination
                            let pageSize = pagination.pageSize
                            let current = pagination.current
                            let old_total = pagination.total

                            let new_total = old_total - selectedRowKeys.length
                            let new_total_page = (new_total - selectedRowKeys.length) / pageSize + 1

                            if (current > new_total_page) {
                                current = Math.floor(new_total_page)
                            }

                            pagination.current = current

                            self._getCdrRecord({
                                item_num: pageSize,
                                page: current === 0 ? 1 : current,
                                sidx: self.state.sorter.field ? self.state.sorter.field : 'd',
                                sord: self.state.sorter.order === "ascend" ? "asc" : "desc"
                            })

                            self._clearSelectRows()

                            self.setState({
                                pagination: pagination
                            })
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

        let actionType = 'cdr_pack'
        let selectedRowKeys = this.state.selectedRowKeys

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
            type: 'post',
            async: true,
            url: api.apiHost,
            data: {
                "action": "packFile",
                "type": actionType,
                "data": selectedRowKeys.join(',')
            },
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
    _deleteAll = () => {
        const { formatMessage } = this.props.intl

        let self = this
        let confirmContent = ''

        if (this.state.cdrRecord.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG2240"})
            })

            return
        }

        confirmContent = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG840" })}}></span>

        confirm({
            content: confirmContent,
            onOk() {
                let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
                let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

                message.loading(loadingMessage, 0)

                $.ajax({
                    type: 'post',
                    async: true,
                    url: api.apiHost,
                    data: {
                        "action": "removeFile",
                        "type": "voice_recording",
                        "data": '*'
                    },
                    success: function(res) {
                        const bool = UCMGUI.errorHandler(res, null, self.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            self._getCdrRecord()
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

        let actionType = 'cdr_pack'

        if (this.state.cdrRecord.length === 0) {
            Modal.warning({
                title: '',
                content: formatMessage({id: "LANG2240"})
            })

            return
        }

        let loadingMessage = ''

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG5391" })}}></span>

        message.loading(loadingMessage, 0)

        $.ajax({
            type: 'post',
            async: true,
            url: api.apiHost,
            data: {
                "action": "packFile",
                "type": actionType,
                "data": 'allCdrRecordFiles.tgz'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()

                    window.open("/cgi?action=downloadFile&type=" + actionType + "&data=allCdrRecordFiles.tgz", '_self')
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
                <span className="sprite sprite-play" title={ formatMessage({id: "LANG777"}) } onClick={ this._play.bind(this, record) }></span>
                <span className="sprite sprite-download" title={ formatMessage({id: "LANG759"}) } onClick={ this._download.bind(this, record) }></span>
                <Popconfirm
                    title={ formatMessage({id: "LANG841"}) }
                    okText={ formatMessage({id: "LANG727"}) }
                    cancelText={ formatMessage({id: "LANG726"}) }
                    onConfirm={ this._delete.bind(this, record) }
                >
                    <span title={ formatMessage({id: "LANG739"}) } className="sprite sprite-del"></span>
                </Popconfirm>  
            </div>
        )
    }
    _handleTableChange = (pagination, filters, sorter) => {
        let pager = this.state.pagination

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

        this._getCdrRecord({
            page: pagination.current,
            item_num: pagination.pageSize,
            sidx: sorter_here.field ? sorter_here.field : 'd',
            sord: sorter_here.order === "ascend" ? "asc" : "desc",
            ...filters
        })
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
                className: 'hidden',
                key: 'n',
                dataIndex: 'n',
                title: formatMessage({id: "LANG135"}),
                sorter: true
            }, {
                key: 'caller',
                dataIndex: 'caller',
                sorter: true,
                title: formatMessage({id: "LANG2646"})
            }, {
                key: 'callee',
                dataIndex: 'callee',
                sorter: true,
                title: formatMessage({id: "LANG2647"})
            }, {
                key: 'd',
                dataIndex: 'd',
                sorter: true,
                title: formatMessage({id: "LANG2645"})
            }, {
                key: 's',
                dataIndex: 's',
                sorter: true,
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
                    1: formatMessage({id: "LANG2640"})
                })

        return (
            <div className="app-content-main">
                <Title
                    isDisplay='hidden'
                    headerTitle={ formatMessage({id: "LANG2640"}) }
                />
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
                            { formatMessage({id: "LANG4761"}, {
                                0: formatMessage({id: "LANG2640"})
                            }) }
                        </Button>
                        <Button
                            type="primary"
                            size='default'
                            onClick={ this._downloadAll }
                        >
                            { formatMessage({id: "LANG741"}, {
                                0: formatMessage({id: "LANG2640"})
                            }) }
                        </Button>
                    </div>
                    <Table
                        rowKey="n"
                        columns={ columns }
                        rowSelection={ rowSelection }
                        loading={ this.state.loading}
                        dataSource={ this.state.cdrRecord }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        showHeader={ !!this.state.cdrRecord.length }
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

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(RecordingFile))
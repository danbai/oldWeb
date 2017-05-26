'use strict'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import $ from 'jquery'
import React, { Component, PropTypes } from 'react'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Modal, Row, Col, Checkbox, message, Tooltip, Upload, Icon, Select, Table, Popconfirm } from 'antd'
const FormItem = Form.Item
import _ from 'underscore'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'

const Option = Select.Option
const confirm = Modal.confirm
const baseServerURl = api.apiHost
const addZero = UCMGUI.addZero

class BackupRestore extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fileList: [],
            fileListUSB: [],
            fileListSD: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            paginationUSB: [],
            paginationSD: [],
            sorter: {
                field: "d",
                order: "asc"
            },
            sorterUSB: [],
            sorterSD: [],
            loading: false,
            visible: false,
            upgradeLoading: true,
            type: "upload",
            fileName: "",
            selectedRowKeys: [],
            selectedRows: [],
            selectedRowKeysUSB: [],
            selectedRowsUSB: [],
            selectedRowKeysSD: [],
            selectedRowsSD: [],
            download_visible: false,
            initPackName: '',
            isRestoreComplete: false,
            classShowUSB: "hidden",
            classShowSD: "hidden"
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {

    }
    _getInitData = () => {
        this._getLocalFileList()
        this._getMediaFileList()
        this._readLog()
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
            selectedRows: [],
            selectedRowKeysUSB: [],
            selectedRowsUSB: [],
            selectedRowKeysSD: [],
            selectedRowsSD: []
        })
    }
    _createNew = (record) => {
        browserHistory.push('/maintenance/backup/create')
    }
    _upload = (record) => {
        this._showModal("upload")
    }
    _regularBackup = (record) => {
        browserHistory.push('/maintenance/backup/regular')
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _getLocalFileList = (
        params = {
            item_num: 10,
            page: 1,
            sidx: 'd',
            sord: 'asc'
        }
        ) => {
        const { formatMessage } = this.props.intl
        this.setState({loading: true})

        $.ajax({
            url: baseServerURl,
            method: 'post',
            data: {
                action: 'listFile',
                type: 'backup',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["tar"]}',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const fileList = response.backup || []
                    const pagination = this.state.pagination
                    // Read total count from server
                    pagination.total = response.total_item
                    fileList.map((item, index) => {
                        fileList[index]["key"] = "local"
                        fileList[index]["id"] = 0
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
    _getMediaFileList = () => {
        const { formatMessage } = this.props.intl
        // this.setState({loading: true})
        const me = this

        $.ajax({
            url: baseServerURl,
            method: 'post',
            data: {
                action: 'listFile',
                type: 'media',
                page: 1,
                item_num: 20000,
                sidx: "d",
                sord: "desc"
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let media = res.response.media
                    let usbDiskName = []
                    let sdName = []
                    let classShowUSB = me.state.classShowUSB
                    let classShowSD = me.state.classShowSD

                    _.each(media, function(item, index) {
                        let name = item.n

                        if (name && name.indexOf("mmcblk") > -1) {
                            sdName.push(name)
                        } else if (name && name.indexOf("sd") > -1) {
                            usbDiskName.push(name)
                        }
                    })

                    if (usbDiskName.length === 0) {
                        classShowUSB = 'hidden'
                    } else {
                        classShowUSB = 'display-block'
                        _.each(usbDiskName, function(item, index) {
                            me._listUsbdiskFile(item, index)
                        })
                    }
                    if (sdName.length === 0) {
                        classShowSD = 'hidden'
                    } else {
                        classShowSD = 'display-block'
                        _.each(sdName, function(item, index) {
                            me._listSddiskFile(item, index)
                        })
                    }
                    this.setState({
                        classShowUSB: classShowUSB,
                        classShowSD: classShowSD
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _listUsbdiskFile = (files, index,
        params = {
            item_num: 10,
            page: 1,
            sidx: 'd',
            sord: 'asc'
        }
    ) => {
        const { formatMessage } = this.props.intl
        const me = this

        $.ajax({
            url: baseServerURl,
            method: 'post',
            data: {
                action: 'listFile',
                type: 'media',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["tar"]}',
                data: files,
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const fileList = response.media || []
                    const fileListUSB = me.state.fileListUSB || []
                    const paginationUSB = me.state.paginationUSB || []
                    const sorterUSB = me.state.sorterUSB || []
                    const pagination = paginationUSB[index] || {
                        showTotal: me._showTotal,
                        showSizeChanger: true,
                        showQuickJumper: true
                    }
                    const sorter = {
                        field: "d",
                        order: "asc"
                    }

                    pagination.total = response.total_item
                    fileList.map((item, i) => {
                        fileList[i]["key"] = files
                        fileList[i]["id"] = index
                    })

                    // Read total count from server
                    if (fileListUSB.length > index) {
                        fileListUSB[index] = fileList
                        paginationUSB[index] = pagination
                        sorterUSB[index] = sorter
                    } else {
                        fileListUSB.push(fileList)
                        paginationUSB.push(pagination)
                        sorterUSB.push(sorter)
                    }

                    me.setState({
                        loading: false,
                        fileListUSB: fileListUSB,
                        paginationUSB: paginationUSB,
                        sorterUSB: sorterUSB
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _listSddiskFile = (files, index,
        params = {
            item_num: 10,
            page: 1,
            sidx: 'd',
            sord: 'asc'
        }
    ) => {
        const { formatMessage } = this.props.intl
        const me = this

        $.ajax({
            url: baseServerURl,
            method: 'post',
            data: {
                action: 'listFile',
                type: 'media',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["tar"]}',
                data: files,
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const fileList = response.media || []
                    const fileListSD = me.state.fileListSD || []
                    const paginationSD = me.state.paginationSD || []
                    const sorterSD = me.state.sorterSD || []
                    const pagination = paginationSD[index] || {
                        showTotal: me._showTotal,
                        showSizeChanger: true,
                        showQuickJumper: true
                    }
                    const sorter = {
                        field: "d",
                        order: "asc"
                    }

                    pagination.total = response.total_item
                    fileList.map((item, i) => {
                        fileList[i]["key"] = files
                        fileList[i]["id"] = index
                    })

                    // Read total count from server
                    if (fileListSD.length > index) {
                        fileListSD[index] = fileList
                        paginationSD[index] = pagination
                        sorterSD[index] = sorter
                    } else {
                        fileListSD.push(fileList)
                        paginationSD.push(pagination)
                        sorterSD.push(sorter)
                    }

                    me.setState({
                        loading: false,
                        fileListSD: fileListSD,
                        paginationSD: paginationSD,
                        sorterSD: sorterSD
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
        let type = "backup"
        let key = record.key
        if (key !== "local") {
            type = "media"
            filename = "/" + key + "/" + record.n
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
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
    _reload = () => {
        const { formatMessage } = this.props.intl
        let isRestoreComplete = this.state.isRestoreComplete || false

        let me = this
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG832" })}}></span>

        this.props.setSpinLoading({loading: true, tip: loadingMessage})
        $.ajax({
            type: "post",
            url: baseServerURl,
            data: {
                "action": "getInfo"
            },
            error: function(jqXHR, textStatus, errorThrown) {
                setTimeout(me._reload, 5000)

                if (!isRestoreComplete) {
                    isRestoreComplete = true
                    me.setState({
                        isRestoreComplete: isRestoreComplete
                    })
                }
            },
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0) && isRestoreComplete) {
                    me.props.setSpinLoading({loading: false})
                    // UCMGUI.logoutFunction.doLogout()

                    UCMGUI.prototype.loginFunction.switchToLoginPanel()
                } else {
                    setTimeout(me._reload, 5000)
                }
            }
        })
    }
    _restore = (record) => {
        const { formatMessage } = this.props.intl
        let filename = "default," + record.n
        let me = this

        if (record.key !== "local") {
            filename = "/media/" + record.key + "/," + record.n
        }

        this.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG1415"})})

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: {
                "action": "restoreUCMConfig",
                "file-restore": filename
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                me.props.setSpinLoading({loading: false})

                let status = data.status
                const bool = UCMGUI.errorHandler(data, null, formatMessage)
                if (bool) {
                    me._reload()
                } else {
                    if (status === -79) {
                        message.error(formatMessage({id: "LANG5627"}))
                    }
                }
            }.bind(this)
        })
    }
    _delete = (record) => {
        const { formatMessage } = this.props.intl

        let fileName = record.n
        let type = "backup"
        let key = record.key
        if (key !== "local") {
            type = "media"
            fileName = "/" + key + "/" + record.n
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
                    if (key === "local") {
                        const pagination = this.state.pagination
                        const pageSize = this.state.pagination.pageSize
                        let current = this.state.pagination.current
                        const old_total = this.state.pagination.total
                        const new_total = old_total - 1
                        const new_total_page = Math.floor((new_total - 1) / 10) + 1
                        if (current > new_total_page) {
                            current = new_total_page
                        }
                        pagination.current = current

                        this._getLocalFileList({
                            item_num: pageSize,
                            page: current,
                            sidx: this.state.sorter.field ? this.state.sorter.field : 'd',
                            sord: this.state.sorter.order === "descend" ? "desc" : "asc"
                        })
                        this.setState({
                            pagination: pagination
                        })
                    } else if (key.indexOf("sd") > -1) {
                        const paginations = this.state.paginationUSB
                        const pagination = paginations[record.id]
                        const pageSize = pagination.pageSize
                        const sorter = this.state.sorterUSB[record.id]
                        let current = pagination.current
                        const old_total = pagination.total
                        const new_total = old_total - 1
                        const new_total_page = Math.floor((new_total - 1) / 10) + 1
                        if (current > new_total_page) {
                            current = new_total_page
                        }
                        pagination.current = current
                        paginations[record.id] = pagination

                        this._listUsbdiskFile(key, record.id, {
                            item_num: pageSize,
                            page: current,
                            sidx: sorter.field ? sorter.field : 'd',
                            sord: sorter.order === "descend" ? "desc" : "asc"
                        })
                        this.setState({
                            paginationUSB: paginations
                        })
                    } else if (key.indexOf("mmcblk") > -1) {
                        const paginations = this.state.paginationSD
                        const pagination = paginations[record.id]
                        const pageSize = pagination.pageSize
                        const sorter = this.state.sorterSD[record.id]
                        let current = pagination.current
                        const old_total = pagination.total
                        const new_total = old_total - 1
                        const new_total_page = Math.floor((new_total - 1) / 10) + 1
                        if (current > new_total_page) {
                            current = new_total_page
                        }
                        pagination.current = current
                        paginations[record.id] = pagination

                        this._listSddiskFile(key, record.id, {
                            item_num: pageSize,
                            page: current,
                            sidx: sorter.field ? sorter.field : 'd',
                            sord: sorter.order === "descend" ? "desc" : "asc"
                        })
                        this.setState({
                            paginationSD: paginations
                        })
                    }
                }
            }.bind(this)
        })
    }
    _deleteSelectOk = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        let me = this

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG871" })}}></span>

        message.loading(loadingMessage)
        let data = this.state.selectedRows
        if (record === "USB") {
            data = this.state.selectedRowsUSB
        } else if (record === "SD") {
            data = this.state.selectedRowsSD
        }
        let filelist = []
        let key = "local"
        data.map((item, index) => {
            key = item.key
            if (key !== 'local') {
                filelist.push(item.key + '/' + item.n)
            } else {
                filelist.push(item.n)
            }
        })

        $.ajax({
            url: baseServerURl,
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
                    let id = 0
                    if (key === "local") {
                        const pagination = me.state.pagination
                        const pageSize = me.state.pagination.pageSize
                        let current = me.state.pagination.current
                        const old_total = me.state.pagination.total
                        const new_total = old_total - me.state.selectedRowKeys.length
                        const new_total_page = Math.floor((new_total - me.state.selectedRowKeys.length) / 10) + 1
                        if (current > new_total_page) {
                            current = new_total_page
                        }
                        pagination.current = current

                        me._getLocalFileList({
                            item_num: pageSize,
                            page: current,
                            sidx: me.state.sorter.field ? me.state.sorter.field : 'd',
                            sord: me.state.sorter.order === "descend" ? "desc" : "asc"
                        })
                        me.setState({
                            pagination: pagination
                        })
                    } else if (key.indexOf("sd") > -1) {
                        const paginations = me.state.paginationUSB
                        const pagination = paginations[id]
                        const pageSize = pagination.pageSize
                        const sorter = me.state.sorterUSB[id]
                        let current = pagination.current
                        const old_total = pagination.total
                        const new_total = old_total - me.state.selectedRowKeysUSB.length
                        const new_total_page = Math.floor((new_total - me.state.selectedRowKeysUSB.length) / 10) + 1
                        if (current > new_total_page) {
                            current = new_total_page
                        }
                        pagination.current = current
                        paginations[id] = pagination

                        me._listUsbdiskFile(key, id, {
                            item_num: pageSize,
                            page: current,
                            sidx: sorter.field ? sorter.field : 'd',
                            sord: sorter.order === "descend" ? "desc" : "asc"
                        })
                        me.setState({
                            paginationUSB: paginations
                        })
                    } else if (key.indexOf("mmcblk") > -1) {
                        const paginations = me.state.paginationSD
                        const pagination = paginations[id]
                        const pageSize = pagination.pageSize
                        const sorter = me.state.sorterSD[id]
                        let current = pagination.current
                        const old_total = pagination.total
                        const new_total = old_total - me.state.selectedRowKeysSD.length
                        const new_total_page = Math.floor((new_total - me.state.selectedRowKeysSD.length) / 10) + 1
                        if (current > new_total_page) {
                            current = new_total_page
                        }
                        pagination.current = current
                        paginations[id] = pagination

                        me._listSddiskFile(key, id, {
                            item_num: pageSize,
                            page: current,
                            sidx: sorter.field ? sorter.field : 'd',
                            sord: sorter.order === "descend" ? "desc" : "asc"
                        })
                        me.setState({
                            paginationSD: paginations
                        })
                    }
                    me._clearSelectRows()
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
        let data = this.state.selectedRowKeys
        if (record === "USB") {
            data = this.state.selectedRowKeysUSB
        } else if (record === "SD") {
            data = this.state.selectedRowKeysSD
        }

        if (data.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG2913"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG818"}, {0: data.join('  ')})}} ></span>,
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
        pager.pageSize = pagination.pageSize

        this.setState({
            pagination: pager,
            sorter: sorter
        })

        this._getLocalFileList({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter.field ? sorter.field : 'd',
            sord: sorter.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _handleTableChangeUSB = (item, index, pagination, filters, sorter) => {
        const pager = this.state.paginationUSB

        pager[index].current = pagination.current
        pager[index].pageSize = pagination.pageSize

        this.setState({
            paginationUSB: pager,
            sorterUSB: sorter
        })

        this._listUsbdiskFile(item, index, {
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter.field ? sorter.field : 'd',
            sord: sorter.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _handleTableChangeSD = (item, index, pagination, filters, sorter) => {
        const pager = this.state.paginationSD

        pager[index].current = pagination.current
        pager[index].pageSize = pagination.pageSize

        this.setState({
            paginationSD: pager,
            sorterSD: sorter
        })

        this._listSddiskFile(item, index, {
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter.field ? sorter.field : 'd',
            sord: sorter.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)
        this.setState({
            selectedRowKeys: selectedRowKeys,
            selectedRows: selectedRows
        })
    }
    _onSelectChangeUSB = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)
        this.setState({
            selectedRowKeysUSB: selectedRowKeys,
            selectedRowsUSB: selectedRows
        })
    }
    _onSelectChangeSD = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)
        this.setState({
            selectedRowKeysSD: selectedRowKeys,
            selectedRowsSD: selectedRows
        })
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
                        title={ <span dangerouslySetInnerHTML=
                                {{ __html: formatMessage({ id: "LANG855" }) }}
                            ></span> }
                            okText={ formatMessage({id: "LANG760"}) }
                            cancelText={ formatMessage({id: "LANG726"}) }
                            onConfirm={ this._restore.bind(this, record) }>
                        <span className="sprite sprite-restore" title={ formatMessage({id: "LANG760"}) }></span>
                    </Popconfirm>
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
    _handleOk = () => {

    }
    _handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    _readLog = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        $.ajax({
            type: "GET",
            url: api.serverRoot + "/html/userdefined/regular_backup_results?_=" + Math.random().toString(),
            dataType: "text",
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status !== 404) {
                    message.error(formatMessage({ id: "LANG909"}))
                }
            },
            success: function(data) {
                let arr = data.split("\n").reverse()
                if (arr.length > 1 && arr[1] === "</html>") {
                    arr = []
                }
                var sLog = "",
                rLang = /(LANG\d+)/g,
                oErrorCode = UCMGUI.initConfig.errorCodes,
                rStatus = /tar\s*\:/,
                sErrorLang = "",
                lan = ""

                for (var i = 0; i < arr.length; i++) {
                    var str = arr[i]

                    if (str !== "") {
                        lan = str.match(/LANG\d+/)
                        if (lan) {
                            lan = lan[0]
                        }

                        str = str.replace(rLang, '<span>' + formatMessage({ id: lan}) + '</span>')
                        var aError = str.split(rStatus)

                        if (aError[1]) {
                            if (aError.length <= 1 || !aError[1].match(/\d/)) {
                                sErrorLang = "LANG909"
                            } else {
                                var nStatus = aError[1].replace(/\s+/g, ""),
                                    bSuccess = nStatus === "0"

                                if (bSuccess) {
                                    sErrorLang = "LANG961"
                                } else {
                                    sErrorLang = oErrorCode[nStatus]

                                    if (sErrorLang === undefined) {
                                        sErrorLang = "LANG909"
                                    }
                                }
                            }
                            str = aError[0] + "tar  " + '<span>' + formatMessage({ id: sErrorLang }) + '</span>'
                            sLog = sLog + '<div class=' + (bSuccess ? '"backup-success"' : '"backup-failed"') + '>' + str + '</div>'
                        }
                    }
                }

                this.setState({
                    log: <span dangerouslySetInnerHTML={{__html: sLog}} ></span>
                })
            }.bind(this)
        })
    }
    _doCleanLog = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        $.ajax({
            type: "GET",
            url: api.apiHost + "action=reloadLog&regularbackuplog=",
            dataType: "json",
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    message.success(formatMessage({ id: "LANG3903"}))
                    this._readLog()
                }
            }.bind(this)
        })
    }
    _cleanLog = () => {
        const { formatMessage } = this.props.intl
        Modal.confirm({
                content: formatMessage({id: "LANG3902"}),
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"}),
                onOk: this._doCleanLog.bind(this)
            })
    }

    _onUploadFormBeforeUploading = (file) => {
        const { formatMessage } = this.props.intl
        let tmp_fname = file.name
        const reg = /^[-a-zA-Z0-9_]+$/

        if (tmp_fname.endsWith('.tar') && reg.test(tmp_fname.slice(0, -4)) === true) {
            // top.dialog.dialogMessage({
            //    type: 'loading',
            //    content: $P.lang("LANG866")
            // });
            return true
        } else {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG850"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
            return false
        }
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
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        const formItemPackLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }
        const me = this

        const columns = [{
                key: 'key',
                dataIndex: 'key',
                className: 'hidden'
            }, {
                key: 'id',
                dataIndex: 'id',
                className: 'hidden'
            }, {
                key: 'n',
                dataIndex: 'n',
                title: formatMessage({id: "LANG135"}),
                sorter: true
            }, {
                key: 'd',
                dataIndex: 'd',
                title: formatMessage({id: "LANG203"}),
                sorter: true
            }, {
                key: 's',
                dataIndex: 's',
                title: formatMessage({id: "LANG2257"}),
                sorter: true,
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
                selectedRowKeys: this.state.selectedRowKeys,
                selectedRows: this.state.selectedRows
            }
        const rowSelectionUSB = {
                onChange: this._onSelectChangeUSB,
                selectedRowKeys: this.state.selectedRowKeysUSB,
                selectedRows: this.state.selectedRowsUSB
            }
        const rowSelectionSD = {
                onChange: this._onSelectChangeSD,
                selectedRowKeys: this.state.selectedRowKeysSD,
                selectedRows: this.state.selectedRowsSD
            }
        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG62"})
                })

        const props = {
            name: 'filename',
            action: baseServerURl + 'action=uploadfile&type=backup',
            showUploadList: false,
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                console.log(info.file.status)
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }
                if (me.state.upgradeLoading) {
                    me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG881"})})
                    me.state.upgradeLoading = false
                    // me._handleCancel()
                }

                if (info.file.status === 'removed') {
                    return
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response
                    if (data) {
                        let status = data.status,
                            response = data.response

                        me.props.setSpinLoading({loading: false})

                        if (data.status === 0 && response && response.result === 0) {
                            me._getLocalFileList()
                            me._handleCancel()
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (data.status === -49) {
                            message.error(formatMessage({id: "LANG2146"}))
                        } else if (!_.isEmpty(response)) {
                            message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                    me.state.upgradeLoading = true
                } else if (info.file.status === 'error') {
                    me.props.setSpinLoading({loading: false})
                    message.error(`${info.file.name} file upload failed.`)
                    me.state.upgradeLoading = true
                }
            },
            onRemove() {
                message.destroy()
            },
            beforeUpload: this._onUploadFormBeforeUploading.bind(this)
        }

        const fileListUSB = this.state.fileListUSB
        const tableUSB = fileListUSB.map((item, index) => {
            return (
                <Table
                    rowKey="n"
                    columns={ columns }
                    pagination={ this.state.paginationUSB[index] }
                    rowSelection={ rowSelectionUSB }
                    dataSource={ item }
                    showHeader={ !!item.length }
                    loading={ this.state.loading}
                    onChange={ this._handleTableChangeUSB.bind(this, item.length > 0 ? item[0].key : '', index) }
                />
                )
        })
        const fileListSD = this.state.fileListSD
        const tableSD = fileListSD.map((item, index) => {
            return (
                <Table
                    rowKey="n"
                    columns={ columns }
                    pagination={ this.state.paginationSD[index] }
                    rowSelection={ rowSelectionSD }
                    dataSource={ item }
                    showHeader={ !!item.length }
                    loading={ this.state.loading}
                    onChange={ this._handleTableChangeSD.bind(this, item.length > 0 ? item[0].key : '', index) }
                />
                )
        })
        return (
            <div className="app-content-main">
                <div className="content">
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG635"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._createNew }
                        >
                            { formatMessage({id: "LANG758"}) }
                        </Button>
                        {/* <Button
                            icon="upload"
                            type="primary"
                            size='default'
                            onClick={ this._upload }
                        >
                            { formatMessage({id: "LANG2256"}) }
                        </Button> */}
                        <Button
                            type="primary"
                            size='default'
                            onClick={ this._regularBackup }
                        >
                            { formatMessage({id: "LANG4048"}) }
                        </Button>
                        <Upload {...props}>
                            <Button type="ghost">
                                <Icon type="upload" /> { formatMessage({id: "LANG2256"}) }
                            </Button>
                        </Upload>
                    </div>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG636"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <div className="top-button">
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._deleteSelect.bind(this, "local") }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG3872"}, {0: formatMessage({id: "LANG2913"})}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="n"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.fileList }
                        showHeader={ !!this.state.fileList.length }
                        loading={ this.state.loading}
                        onChange={ this._handleTableChange }
                    />
                    <div className={ this.state.classShowUSB }>
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG2916"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <div className="top-button">
                            <Button
                                icon="delete"
                                type="primary"
                                size='default'
                                onClick={ this._deleteSelect.bind(this, "USB") }
                                disabled={ !this.state.selectedRowKeysUSB.length }
                            >
                                { formatMessage({id: "LANG3872"}, {0: formatMessage({id: "LANG2913"})}) }
                            </Button>
                        </div>
                        { tableUSB }
                    </div>
                    <div className={ this.state.classShowSD }>
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG2920"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <div className="top-button">
                            <Button
                                icon="delete"
                                type="primary"
                                size='default'
                                onClick={ this._deleteSelect.bind(this, "SD") }
                                disabled={ !this.state.selectedRowKeysSD.length }
                            >
                                { formatMessage({id: "LANG3872"}, {0: formatMessage({id: "LANG2913"})}) }
                            </Button>
                        </div>
                        { tableSD }
                    </div>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG4076"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <div>
                        <Button type="primary" onClick={ this._cleanLog }>{formatMessage({id: "LANG743"})}</Button>
                    </div>
                    <div>
                        <p > <span >
                           { this.state.log }
                        </span></p>
                    </div>
                    <Modal
                        className="app-content-ldapPhonebook"
                        title={ formatMessage({id: "LANG1607"}) }
                        visible={ this.state.visible }
                        onOk={ this._handleOk }
                        onCancel={ this._handleCancel }
                        okText={ formatMessage({ id: "LANG782" }) }
                        cancelText={ formatMessage({id: "LANG726"}) }
                    >
                        <Form>
                            <div ref="upload" className={ this.state.type === "upload" ? "display-block" : "hidden" }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG2256"}) }>
                                    { getFieldDecorator('upload', {
                                        valuePropName: 'fileList',
                                        normalize: this._normFile
                                    })(
                                        <Upload {...props}>
                                            <Button type="ghost">
                                                <Icon type="upload" /> { formatMessage({id: "LANG1607"}) }
                                            </Button>
                                        </Upload>
                                    ) }
                                </FormItem>
                                <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG850"})}} ></span>
                            </div>
                        </Form>
                    </Modal>
                </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

BackupRestore.propTypes = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(BackupRestore)))

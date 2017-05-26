'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Table, Form, Input, Button, Row, Col, Checkbox, Popconfirm, message, Tooltip, Select, Upload, Icon, Spin, Modal } from 'antd'
const FormItem = Form.Item
import { FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Validator from "../../api/validator"
import _ from 'underscore'

const baseServerURl = api.apiHost

class MusicOnHoldList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            selectedRowKeys: [],
            recordFiles: [],
            type: "upload",
            fileName: "",
            selectedRows: []
        }
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
            this.props.form.resetFields(['newvmenu_name'])
        } else {
            this.setState({
                visible: true,
                type: type
            })
            this.props.form.resetFields(['newvmenu_name'])
        }
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: []
        })
    }
    _handleOk = () => {
        if (this.state.type === "recordNew") {
            this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values)
                }
                if (err && err.hasOwnProperty('newvmenu_name')) {

                } else {
                    this.setState({
                        visible: false
                    })
                    this._recordFile()
                }
            })
        } else {
            this.setState({
                visible: false
            })
            this._playRecordFile()
        }
    }
    _handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    _batchDelete = () => {
        const { formatMessage } = this.props.intl
        const me = this

        if ((this.state.selectedRows.length === this.props.mohList.length) && (this.props.mohClass.toLowerCase() === "default" || (this.props.mohClass.toLowerCase() === ""))) {
            message.warning(formatMessage({id: "LANG870"}))
            return
        }
        let selectedItems = this.state.selectedRows,
            soundFilesName = [],
            mohClass = me.props.mohClass

        selectedItems.map(function(item, key) {
            if (mohClass !== "") {
                soundFilesName.push(mohClass + "/" + item.n)
            } else {
                soundFilesName.push(item.n)
            }
        })        
        message.loading(formatMessage({id: "LANG825"}, {0: formatMessage({id: "LANG3719"})}), 0)

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: {
                "action": "removeFile",
                "type": "moh",
                "data": soundFilesName.join(",,")
            },
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)
                message.destroy()

                if (bool) {
                    message.success(formatMessage({id: "LANG871"}))
                    this.props.getMohList()
                    this._clearSelectRows()
                }
            }.bind(this)
        })
    }
    _recordNew = (record) => {
        this._showModal("recordNew")
    }
    _upload = (record) => {
        this._showModal("upload")
    }
    _record = (record) => {
        this._showModal("record", record)
    }
    _play = (record) => {
        this._showModal("play", record)
    }
    _delete = (record) => {
        const { formatMessage } = this.props.intl

        let fileName = record.n

        if (this.props.mohClass.toLowerCase() !== "") {
            fileName = this.props.mohClass + "/" + fileName
        } else if (this.props.mohList.length === 1) {
            message.warning(formatMessage({ id: "LANG870" }))

            return false
        }
        let action = {
            action: "removeFile",
            type: "moh",
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
                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2798" })}}></span>)
                    this.props.getMohList()
                    // initUpload()
                }
            }.bind(this)
        })
    }
    _download = (record) => {
        const { formatMessage } = this.props.intl

        let filename = record.n

        if (this.props.mohClass.toLowerCase() !== "") {
            filename = this.props.mohClass + "/" + filename
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: {
                "action": "checkFile",
                "type": "moh",
                "data": filename
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    window.open("/cgi?action=downloadFile&type=moh&data=" + encodeURIComponent(filename), '_self')
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })
    }
    _createOption = (text, record, index) => {
        const { formatMessage } = this.props.intl

        let delBtn = <Popconfirm 
                    title={ <span dangerouslySetInnerHTML=
                                {{ __html: formatMessage({ id: "LANG818" }, { 0: record.n }) }}
                            ></span> }
                        okText={ formatMessage({id: "LANG727"}) }
                        cancelText={ formatMessage({id: "LANG726"}) }
                        onConfirm={ this._delete.bind(this, record) }>
                    <span className="sprite sprite-del" title={ formatMessage({ id: "LANG739"})}></span>
                </Popconfirm>
        if (this.props.mohClass === "" && this.props.mohList.length === 1) {
            delBtn = <span className="sprite sprite-del-disabled" title={ formatMessage({ id: "LANG739"})}></span>
        }

        return <span>
                <Popconfirm 
                    title={ <span dangerouslySetInnerHTML=
                                {{ __html: formatMessage({ id: "LANG876" }) }}
                            ></span> }
                        okText={ formatMessage({id: "LANG727"}) }
                        cancelText={ formatMessage({id: "LANG726"}) }
                        onConfirm={ this._record.bind(this, record) }>
                    <span className="sprite sprite-records" title={ formatMessage({ id: "LANG784"})}></span>
                </Popconfirm>
                <span className="sprite sprite-play" title={ formatMessage({ id: "LANG777"})} onClick={ this._play.bind(this, record) }></span>
                <span className="sprite sprite-download" title={ formatMessage({ id: "LANG759"})} onClick={ this._download.bind(this, record) }></span>
                { delBtn }
            </span>
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _renderClass = () => {
        if (this.state.type === "play" || this.state.type === "record") {
            return "display-block"
        } else {
            return "hidden"
        }
    }
    _renderModalTitle = () => {
        const { formatMessage } = this.props.intl

        let type = this.state.type

        if (type === "recordNew") {
            return formatMessage({ id: "LANG775" })
        } else if (type === "play") {
            return formatMessage({ 
                id: "LANG675" 
            }, {
                0: this.state.fileName
            })
        } else if (type === "upload") {
            return formatMessage({ id: "LANG1607" })
        } else {
            return formatMessage({ 
                id: "LANG222" 
            }, {
                0: formatMessage({ id: "LANG238" }),
                1: this.state.fileName
            })
        }
    }
    _renderModalOkText = () => {
        const { formatMessage } = this.props.intl

        let type = this.state.type
        
        if (type === "recordNew" || type === "record") {
            return formatMessage({ id: "LANG778" })
        } else if (type === "play") {
            return formatMessage({ id: "LANG777" })
        } else if (type === "upload") {
            return formatMessage({ id: "LANG782" })
        } else {
            return formatMessage({id: "LANG728"})
        }
    }
    _renderModalCancelText = () => {
        const { formatMessage } = this.props.intl
        
        return formatMessage({id: "LANG726"})
    }
    _getSelectedItems = () => {
        let selectedItems = this.state.selectedRows,
            confirmList = []

        selectedItems.map(function(item, key) {
            confirmList.push("<font>" + item.n + "</font>")
        })

        return confirmList.join('<br>')
    }
    _checkFilename = (rule, value, callback, errMsg) => {
        const { form } = this.props

        let newvmenuName = form.getFieldValue("newvmenu_name"),
            arr = []

        this.props.mohList.map(function(item, key) {
            arr.push(item.n)
        })

        if (_.find(arr, function (num) { 
            return num === newvmenuName + ".wav"
        })) {
            callback(errMsg)
        }
        callback()
    }
    _removeSuffix(filename) {
        let name = filename.toLocaleLowerCase(),
            file_suffix = [".mp3", ".wav", ".gsm", ".ulaw", ".alaw"]

        for (let i = 0; i < file_suffix.length; i++) {
            let num = name.lastIndexOf(file_suffix[i])

            if (num !== -1 && name.endsWith(file_suffix[i])) {
                filename = filename.substring(0, num)

                return filename
            }
        }
    }
    _playRecordFile = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let fileName = this.state.fileName,
            mohClass = this.props.mohClass,
            checkFileName = ''

        let playMoh = mohClass
        if (mohClass && mohClass.slice(0, 10) === 'guimohdir_') {
            playMoh = mohClass.slice(10)
        }

        if (mohClass !== "") {
            checkFileName = mohClass + "/" + fileName
        } else {
            checkFileName = fileName
        }
        $.ajax({
            type: "post",
            url: baseServerURl,
            async: false,
            data: {
                "action": "checkFile",
                "type": "moh",
                "data": checkFileName
            },
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    let y = form.getFieldValue("playVmenu_ext")

                    if (this.state.type === 'play') {
                        $.ajax({
                            type: "post",
                            url: baseServerURl,
                            async: true,
                            data: {
                                "action": 'playPromptByOrg',
                                "channel": y,
                                "type": 'moh',
                                "class": playMoh,
                                "Variable": this._removeSuffix(fileName)
                            },
                            error: function(jqXHR, textStatus, errorThrown) {},
                            success: function(data) {
                                message.success(formatMessage({id: "LANG873"}))
                            }
                        })
                    } else if (this.state.type === 'record') {
                        this._recordFile(y)
                    }
                } else {
                        message.error(formatMessage({id: "LANG3868"}))
                    }
                }.bind(this)
            })
    }
    _recordFile = (extension) => { // uses/dials  extension to record into CURRENT_FILE
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let newvmenuName = form.getFieldValue("newvmenu_name"),
            newvmenuFormat = form.getFieldValue("newvmenu_format"),
            newvmenuExt = form.getFieldValue("newvmenu_ext"),
            variable = newvmenuName + newvmenuFormat

        if (this.state.type === 'record') {
            newvmenuExt = extension
            variable = this.state.fileName
        }
        $.ajax({
            type: "post",
            url: baseServerURl,
            async: true,
            data: {
                "action": 'recordPromptByOrg',
                "channel": newvmenuExt,
                "type": 'moh',
                "class": this.props.mohClass,
                "Variable": variable
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                message.success(formatMessage({id: "LANG873"}))
                message.destroy()

                message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG878" })}}></span>, 0)
                setTimeout(() => {
                    message.destroy()
                    message.info(formatMessage({id: "LANG879"}))
                }, 3000)
            }
        })
    }
    _checkFormat = (file) => {
        const { formatMessage } = this.props.intl
        const tmp_fname = file.name.toLowerCase()
        if (/^[^\s+\[&#(\/`;*?,|\$\>\]\+\']*$/.test(tmp_fname)) {
            if (file.size < (30 * 1024 * 1024) && (/^[a-zA-Z0-9_\-]+(\.tar|\.tgz|\.tar\.gz)$/g.test(tmp_fname))) {
                return true
            } else if (file.size < (5 * 1024 * 1024) && 
                (tmp_fname.slice(-4) === '.mp3' ||
                    tmp_fname.slice(-4) === '.wav' ||
                    tmp_fname.slice(-4) === '.gsm' ||
                    tmp_fname.slice(-5) === '.alaw' ||
                    tmp_fname.slice(-5) === '.ulaw')
                ) {
                return true
            } else {
                Modal.warning({
                    content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5406"})}} ></span>,
                    okText: (formatMessage({id: "LANG727"}))
                })
                return false
            }
        } else {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2552"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
            return false
        }
    }
    _showFoot = () => {
        let type = this.state.type
        
        if (type === "upload") {
            return null
        } else {
            return (
            <span>
                <Button onClick={ this._handleCancel }>{ this._renderModalCancelText() }
                </Button>
                <Button type="primary" onClick={ this._handleOk }>{ this._renderModalOkText() }
                </Button>
            </span>
            )
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        const me = this

        const columns = [
            {
                key: 'n',
                dataIndex: 'n', 
                title: formatMessage({id: "LANG1606"})
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => (
                    this._createOption(text, record, index)
                )
            }
        ]

        // rowSelection objects indicates the need for row selection
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
                this.setState({ selectedRowKeys, selectedRows })
            },
            onSelect: (record, selected, selectedRows) => {
                console.log(record, selected, selectedRows)
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
                console.log(selected, selectedRows, changeRows)
            }
        }

        const pagination = {
            total: this.props.mohList.length,
            showSizeChanger: true,
            onShowSizeChange: (current, pageSize) => {
                console.log('Current: ', current, '; PageSize: ', pageSize)
            },
            onChange: (current) => {
                console.log('Current: ', current)
            },
            showTotal: me._showTotal,
            showQuickJumper: true
        }
        const props = {
            name: 'file',
            action: baseServerURl + 'action=uploadfile&type=moh&data=' + this.props.mohClass,
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
                    me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG979"})})
                    me.setState({upgradeLoading: false})
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

                        // me.props.setSpinLoading({loading: false})

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2797" })}}></span>)
                            me.props.getMohList()
                            me._handleCancel()
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (!_.isEmpty(response)) {
                            message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                }
            },
            onRemove() {
                me.props.setSpinLoading({loading: false})
                message.destroy()
            },
            beforeUpload: me._checkFormat
        }

        return (
            <div className="content">
                <div className="top-button">
                    <Button 
                        type="primary" 
                        icon="record" 
                        size='default' 
                        onClick={ this._recordNew }>
                        { formatMessage({id: "LANG775" }) }
                    </Button>
                    <Popconfirm 
                        className={ this.state.selectedRowKeys.length ? "display-inline" : "hidden"}
                        title={ <span dangerouslySetInnerHTML=
                                    {{ __html: formatMessage({ id: "LANG4273" }, { 0: this._getSelectedItems() }) }}
                                ></span> }
                        okText={ formatMessage({id: "LANG727"}) }
                        cancelText={ formatMessage({id: "LANG726"}) }
                        onConfirm={ this._batchDelete.bind(this) }>
                        <Button 
                            type="primary" 
                            icon="delete" 
                            size='default' 
                            disabled={ !this.state.selectedRowKeys.length } >
                            { formatMessage({id: "LANG3718"}) }
                        </Button>
                    </Popconfirm>
                    <Button 
                        type="primary" 
                        icon="upload" 
                        size='default' 
                        onClick={ this._upload }>
                        { formatMessage({id: "LANG782"}) }
                    </Button>
                </div>
                <Table
                    bordered
                    rowSelection={ rowSelection }
                    columns={ columns }
                    dataSource={ this.props.mohList }
                    pagination={ pagination }
                    showHeader={ !!this.props.mohList.length } 
                />
                <Modal 
                    title={ this._renderModalTitle() }
                    visible={ this.state.visible }
                    onOk={ this._handleOk } 
                    onCancel={ this._handleCancel }
                    okText={ this._renderModalOkText() }
                    cancelText={ this._renderModalCancelText() }
                    footer = { this._showFoot() }
                    >
                    <Form>
                        <div ref="recordnew_content" className={ this.state.type === "recordNew" ? "display-block" : "hidden" }>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG572"}) }>
                                { getFieldDecorator('newvmenu_name', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{ 
                                        required: true, 
                                        message: formatMessage({id: "LANG2150"})
                                    }, { 
                                        validator: (data, value, callback) => {
                                            Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                        }
                                    }, { 
                                        validator: (data, value, callback) => {
                                            let errMsg = formatMessage({
                                                id: "LANG2146"
                                            })
                                            this._checkFilename(data, value, callback, errMsg)
                                        }
                                    }],
                                    initialValue: ""
                                })(
                                    <Input maxLength="40" />
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG272"}) }>
                                { getFieldDecorator('newvmenu_format', {
                                    rules: [],
                                    initialValue: ".gsm"
                                })(
                                    <Select>
                                        <Option value='.gsm'>GSM</Option>
                                        <Option value='.wav'>WAV</Option>
                                    </Select>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1608" /> }>
                                            <span>{ formatMessage({id: "LANG85"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('newvmenu_ext', {
                                    rules: [],
                                    initialValue: this.props.extensionList[0] ? this.props.extensionList[0].val : ""
                                })(
                                    <Select>
                                        {
                                           this.props.extensionList.map(function(it) {
                                            const val = it.val
                                            const text = it.text
                                            const disabled = it.disabled

                                            return <Option key={ val } value={ val } disabled={ disabled }>
                                                   { text ? text : val }
                                                </Option>
                                            })
                                       }
                                    </Select>
                                ) }
                            </FormItem>
                        </div>
                        <div ref="playFile_content" className={ this._renderClass() }>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG1609"}) }>
                                <div ref="playVmenu_name">{ this.state.fileName }</div>
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: this.state.type === "play" ? "LANG1611" : "LANG1612"}) }>
                                { getFieldDecorator('playVmenu_ext', {
                                    rules: [],
                                    initialValue: this.props.extensionList[0] ? this.props.extensionList[0].val : ""
                                })(
                                    <Select>
                                        {
                                           this.props.extensionList.map(function(it) {
                                            const val = it.val
                                            const text = it.text
                                            const disabled = it.disabled

                                            return <Option key={ val } value={ val } disabled={ disabled }>
                                                   { text ? text : val }
                                                </Option>
                                            })
                                       }
                                    </Select>
                                ) }
                            </FormItem>
                        </div>
                        <div ref="upload" className={ this.state.type === "upload" ? "display-block" : "hidden" }>
                            <FormItem
                                { ...formItemLayout }
                                label={ formatMessage({id: "LANG1607"}) }>
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
                            <span>{formatMessage({id: "LANG672"})}</span>
                            <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4227"})}} ></span>
                            <span>{formatMessage({id: "LANG2640"})}</span>
                        </div>
                    </Form>
                </Modal>
            </div>
        )
    }
}

export default Form.create()(injectIntl(MusicOnHoldList))

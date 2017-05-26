'use strict'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Modal, Button, Row, Col, Checkbox, message, Tooltip, Select, Popconfirm, Upload, Table, Icon, Spin } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
import _ from 'underscore'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import MusicOnHoldList from './musicOnHoldList'
import Validator from "../../api/validator"
import Title from '../../../views/title'

const baseServerURl = api.apiHost

let mohsuggest = "",
    mohinterpret = "",
    siptosSettings = {}

class MusicOnHold extends Component {
    constructor(props) {
        super(props)
        this.state = {
            classData: [],
            mohList: [],
            mohClass: "",
            extensionList: [],
            extensionLen: 0,
            mohNameList: [],
            moh: {},
            delStyle: "sprite sprite-del",
            disabledDeleteMoh: true,
            visible: false,
            type: '',
            downloadAllName: '',
            visibleList: false,
            selectedRowKeys: [],
            recordFiles: [],
            typeList: "upload",
            fileName: "",
            selectedRows: [],
            uploadType: 'moh',
            upgradeLoading: true
        }
    }
    componentDidMount() {
        this._getNameList("first")
        // this._getMohInfo()
        let extension = UCMGUI.isExist.getList("getAccountList")

        this.setState({
            extensionList: this._transData(extension),
            extensionLen: extension.length
        })
    }
    componentWillUnmount() {

    }
    _transData = (res, cb) => {
        const { formatMessage } = this.props.intl

        let arr = []

        for (let i = 0; i < res.length; i++) {
            let obj = {},
                extension = res[i].extension,
                fullname = res[i].fullname,
                disabled = res[i].out_of_service

            obj["val"] = extension

            if (disabled === 'yes') {
                obj["class"] = 'disabledExtOrTrunk'
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + formatMessage({ id: 'LANG273'}) + '>'
                obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <'
                obj["disable"] = true // disabled extension
            } else {
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '')
            }

            arr.push(obj)
        }

        if (cb && typeof cb === "function") {
            cb(arr)
        }

        return arr
    }
    _getMohInfo() {
        /* unused */
        const { formatMessage } = this.props.intl
        const form = this.props.form

        let mohVal = form.getFieldValue("moh_classes")

        if (mohVal !== "default") {
            if (mohVal.slice(0, 10) === 'guimohdir_') {
                mohVal = mohVal.split("guimohdir_")[1]
            }
        } else {
            mohVal = "default"
        }

        let action = {
            "action": "getMoh",
            "moh": mohVal
        }

        $.ajax({
            type: "post",
            url: api.apiHost,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    let moh = data.response.moh

                    this.setState({
                        moh: moh
                    })
                    this.props.form.setFieldsValue({
                        moh_name: mohVal,
                        sort: moh.sort ? moh.sort : 'random'
                    })
                }
            }.bind(this)
        })
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: []
        })
    }
    _getNameList(flag = 'first') {
        const { form } = this.props

        let mohNameList = UCMGUI.isExist.getList("getMohNameList")

        let opts = this._transClassData(mohNameList)

        this.setState({
            mohNameList: mohNameList,
            classData: opts
        })

        if (flag === "first") {
            form.setFieldsValue({
                moh_classes: "default"
            })

            // bindListEvent()
        } else {
            if (flag !== 'default') {
                form.setFieldsValue({
                    moh_classes: 'guimohdir_' + flag
                })
            }
        }
        this._getMohList()
    }
    _transClassData = (res) => {
        let arr = []

        for (let i = 0; i < res.length; i++) {
            let obj = {}

            if (res[i] === "default") {
                obj["text"] = res[i]
                obj["val"] = "default"
            } else {
                obj["text"] = res[i]
                obj["val"] = "guimohdir_" + res[i]
            }

            arr.push(obj)
        }

        return arr
    }
    _onChange = (value) => {
        const me = this

        if (value === 'default') {
            this.setState({
                disabledDeleteMoh: true,
                mohClass: ''
            })
            this.props.form.setFieldsValue({
                mohClass: ''
            })
        } else if (value === 'guimohdir_ringbacktone_default') {
            this.setState({
                disabledDeleteMoh: true,
                mohClass: value.split("guimohdir_")[1]
            })
            this.props.form.setFieldsValue({
                mohClass: value.split("guimohdir_")[1]
            })
        } else {
            this.setState({
                disabledDeleteMoh: false,
                mohClass: value.split("guimohdir_")[1]
            })
            this.props.form.setFieldsValue({
                mohClass: value.split("guimohdir_")[1]
            })
        }
        this._clearSelectRows()

        setTimeout(() => {
            me._getMohList()
        }, 200)
    }
    _getMohList = () => {
        const { form } = this.props

        let mohClass = form.getFieldValue("moh_classes")

        if (mohClass === "default") {
            mohClass = ""
        }

        $.ajax({
            url: baseServerURl,
            data: {
                action: "listFile",
                type: "moh",
                filter: JSON.stringify({
                    "list_dir": 0,
                    "list_file": 1,
                    "file_suffix": ["mp3", "wav", "gsm", "ulaw", "alaw"]
                }),
                data: mohClass,
                sidx: "n",
                sord: "asc"
            },
            type: 'POST',
            dataType: 'json',
            async: true,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(res) {
                let moh = res.response.moh || []

                for (let i = 0; i <= moh.length - 1; i++) {
                    moh[i]["key"] = i
                }
                if (mohClass === "" || mohClass === "guimohdir_ringbacktone_default") {
                    this.setState({
                        mohList: moh,
                        mohClass: mohClass,
                        delStyle: "sprite sprite-del-disabled hidden"
                    })
                } else {
                    this.setState({
                        mohList: moh,
                        mohClass: mohClass,
                        delStyle: "sprite sprite-del"
                    })
                }
            }.bind(this)
        })
        // this._getMohInfo()
    }
    _generateDownloadAllName = () => {
        let months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
            today = new Date(),
            year = today.getFullYear(),
            // month = months[today.getMonth()],
            month = (today.getMonth() + 1),
            day = UCMGUI.addZero(today.getDate()),
            hour = UCMGUI.addZero(today.getHours()),
            minute = UCMGUI.addZero(today.getMinutes()),
            seconds = UCMGUI.addZero(today.getSeconds())

        // if (mode == "downloadAll") {
        //     downloadAllName = "prompt_" + year + month + day + "_" + hour + minute + seconds
        // } else if (mode == "downloadAllMOH") {
        //    downloadAllName = "moh_" + year + month + day + "_" + hour + minute + seconds
        // }

        return "moh_" + year + month + day + "_" + hour + minute + seconds
    }
    _showModal = (type) => {
        const form = this.props.form

        if (type !== "downloadAllMOH") {
            this.setState({
                visible: true,
                type: type
            })
        } else {
            this.setState({
                visible: true,
                type: type,
                downloadAllName: this._generateDownloadAllName()
            })
            form.setFieldsValue({
                downloadAll_name: this._generateDownloadAllName(),
                moh_name: this._generateDownloadAllName()
            })
        }

        if (type === "add") {
            form.setFieldsValue({
                moh_name: ""
            })
        }
        if (type === "edit") {
            this._getMohInfo()
        }
    }
    _add = () => {
        this._showModal("add")
    }
    _addMOH = () => {
        const { formatMessage } = this.props.intl

        // if (mode == "add") {
        //     action["moh_name"] = mohNameLowerCase

        // } else {
        //     action["moh"] = mohName;

        //     this._updateOrAddMohInfo(action)
        // }
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err || (err && !err.hasOwnProperty('moh_name')) || this.state.type === "edit") {
                this.setState({
                    visible: false
                })
                console.log('Received values of form: ', values)

                let action = {}

                action["sort"] = values.sort
                action["action"] = this.state.type === "add" ? 'addMoh' : "updateMoh"

                if (this.state.type === "add") {
                    action["moh_name"] = values.moh_name

                    let mkDirAction = {
                        action: "mkDir",
                        type: "moh",
                        data: "guimohdir_" + values.moh_name
                    }

                    $.ajax({
                        type: "post",
                        url: baseServerURl,
                        data: mkDirAction,
                        error: function(jqXHR, textStatus, errorThrown) {
                        },
                        success: function(data) {
                            const bool = UCMGUI.errorHandler(data, null, formatMessage)

                            if (bool) {
                                this._updateOrAddMohInfo(action)
                            }
                        }.bind(this)
                    })
                } else {
                    action["moh"] = values.moh_name
                    this._updateOrAddMohInfo(action)
                }
            }
        })
    }
    _updateOrAddMohInfo(action) {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                    this._getNameList(action.moh)
                }
            }.bind(this)
        })
    }
    _download = () => {
        this._showModal("downloadAllMOH")
    }
    _downloadFile = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        let returnValue = false
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err && err.hasOwnProperty('downloadAll_name')) {
                returnValue = true
            }
        })

        if (returnValue) {
            return
        }
        this.setState({
            visible: false
        })

        let downloadAllName = form.getFieldValue("downloadAll_name") + '.tar',
            encodeFileName = encodeURIComponent(downloadAllName)

        message.loading(formatMessage({id: "LANG5391"}), 0)

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: {
                'action': 'packFile',
                'type': "moh",
                'data': downloadAllName
            },
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, formatMessage)

                if (bool) {
                    window.open("/cgi?action=downloadFile&type=moh" + "&data=" + encodeFileName, '_self')

                    message.destroy()
                }
            }
        })
    }
    _edit = () => {
        this._showModal("edit")
    }
    _delete = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        let mohClass = form.getFieldValue("moh_classes")

        if (mohClass === "default" || mohClass === 'guimohdir_ringbacktone_default') {
            mohClass = ""
            return
        }

        let action = {
            action: "removeFile",
            type: "moh",
            data: mohClass
        }

        let mohName = mohClass.split("guimohdir_")[1]

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, formatMessage)

                if (bool) {
                    $.ajax({
                        type: "post",
                        url: baseServerURl,
                        data: {
                            "action": "deleteMoh",
                            "moh": mohName
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                        },
                        success: function(res) {
                            const bool = UCMGUI.errorHandler(res, null, formatMessage)

                            if (bool) {
                                message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>)

                                this._getNameList()
                                // judgeIfMohDel(mohName)

                                // getNameList("del")
                            }
                        }.bind(this)
                    })
                }
            }.bind(this)
        })
    }
    _handleOk = () => {
        let type = this.state.type

        if (type === "downloadAllMOH") {
            this._downloadFile()
        } else if (type === "add" || type === "edit") {
            this._addMOH()
        }
    }
    _handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    _renderModalTitle = () => {
        const { formatMessage } = this.props.intl
        let type = this.state.type

        if (type === "add") {
            return formatMessage({id: "LANG774"})
        } else if (type === "downloadAllMOH") {
            return formatMessage({
                id: "LANG741"
            }, {
                0: formatMessage({id: "LANG27"})
            })
        } else {
            return formatMessage({id: "LANG2505"})
        }
    }
    _mohNameIsExist = (rule, value, callback, errMsg) => {
        if (_.find(this.state.mohNameList, function (num) {
            return num.toLowerCase() === value.toLowerCase()
        }) && value) {
            callback(errMsg)
        }
        callback()
    }
    _showFoot = () => {
        const { formatMessage } = this.props.intl

        return (
            <span>
                <Button onClick={ this._handleCancel }>{formatMessage({id: "LANG726"})}
                </Button>
                <Button type="primary" onClick={ this._handleOk }>{this.state.type !== "downloadAllMOH" ? formatMessage({id: "LANG728"}) : formatMessage({id: "LANG759"})}
                </Button>
            </span>
            )
    }

    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _showModalList = (type, record) => {
        if (typeof record !== "undefined") {
            this.setState({
                visibleList: true,
                typeList: type,
                fileName: record.n
            })
            this.props.form.resetFields(['newvmenu_name'])
        } else {
            this.setState({
                visibleList: true,
                typeList: type
            })
            this.props.form.resetFields(['newvmenu_name'])
        }
    }
    _handleOkList = () => {
        if (this.state.typeList === "recordNew") {
            this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values)
                }
                if (err && err.hasOwnProperty('newvmenu_name')) {

                } else {
                    this.setState({
                        visibleList: false
                    })
                    this._recordFile()
                }
            })
        } else {
            this.setState({
                visibleList: false
            })
            this._playRecordFile()
        }
    }
    _handleCancelList = () => {
        this.setState({
            visibleList: false
        })
    }
    _onChangeUploadType = (e) => {
        this.setState({
            uploadType: e
        })
    }
    _batchDelete = () => {
        const { formatMessage } = this.props.intl
        const me = this

        if ((this.state.selectedRows.length === this.state.mohList.length) && (this.state.mohClass.toLowerCase() === "default" || (this.state.mohClass.toLowerCase() === ""))) {
            message.warning(formatMessage({id: "LANG870"}))
            return
        }
        let selectedItems = this.state.selectedRows,
            soundFilesName = [],
            mohClass = me.state.mohClass

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
                    this._getMohList()
                    this._clearSelectRows()
                }
            }.bind(this)
        })
    }
    _recordNew = (record) => {
        this._showModalList("recordNew")
    }
    _upload = (record) => {
        this._showModalList("upload")
    }
    _record = (record) => {
        this._showModalList("record", record)
    }
    _play = (record) => {
        this._showModalList("play", record)
    }
    _deleteList = (record) => {
        const { formatMessage } = this.props.intl

        let fileName = record.n

        if (this.state.mohClass.toLowerCase() !== "") {
            fileName = this.state.mohClass + "/" + fileName
        } else if (this.state.mohList.length === 1) {
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
                    this._getMohList()
                    this._clearSelectRows()
                    // initUpload()
                }
            }.bind(this)
        })
    }
    _downloadList = (record) => {
        const { formatMessage } = this.props.intl

        let filename = record.n

        if (this.state.mohClass.toLowerCase() !== "") {
            filename = this.state.mohClass + "/" + filename
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
                        onConfirm={ this._deleteList.bind(this, record) }>
                    <span className="sprite sprite-del" title={ formatMessage({ id: "LANG739"})}></span>
                </Popconfirm>
        if (this.state.mohClass === "" && this.state.mohList.length === 1) {
            delBtn = <span className="sprite sprite-del-disabled" title={ formatMessage({ id: "LANG739"})}></span>
        } else if (this.state.mohClass === 'guimohdir_ringbacktone_default' && record.n === 'ring_back.gsm') {
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
                <span className="sprite sprite-download" title={ formatMessage({ id: "LANG759"})} onClick={ this._downloadList.bind(this, record) }></span>
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
        if (this.state.typeList === "play" || this.state.typeList === "record") {
            return "display-block"
        } else {
            return "hidden"
        }
    }
    _renderModalTitleList = () => {
        const { formatMessage } = this.props.intl

        let type = this.state.typeList

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

        let type = this.state.typeList

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

        this.state.mohList.map(function(item, key) {
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
            mohClass = this.state.mohClass,
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

                    if (this.state.typeList === 'play') {
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
                    } else if (this.state.typeList === 'record') {
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
            variable = newvmenuName + newvmenuFormat,
            mohClass = this.state.mohClass

        if (this.state.typeList === 'record') {
            newvmenuExt = extension
            variable = this.state.fileName
        }

        let playMoh = mohClass
        if (mohClass && mohClass.slice(0, 10) === 'guimohdir_') {
            playMoh = mohClass.slice(10)
        }
        $.ajax({
            type: "post",
            url: baseServerURl,
            async: true,
            data: {
                "action": 'recordPromptByOrg',
                "channel": newvmenuExt,
                "type": 'moh',
                "class": playMoh,
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
            if (file.size < (5 * 1024 * 1024) &&
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
    _checkFormatTar = (file) => {
        const { formatMessage } = this.props.intl
        const tmp_fname = file.name.toLowerCase()
        if (/^[^\s+\[&#(\/`;*?,|\$\>\]\+\']*$/.test(tmp_fname)) {
            if (file.size < (30 * 1024 * 1024) && (/^[a-zA-Z0-9_\-]+(\.tar|\.tgz|\.tar\.gz)$/g.test(tmp_fname))) {
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
    _showFootList = () => {
        let type = this.state.typeList

        if (type === "upload") {
            return null
        } else {
            return (
            <span>
                <Button onClick={ this._handleCancelList }>{ this._renderModalCancelText() }
                </Button>
                <Button type="primary" onClick={ this._handleOkList }>{ this._renderModalOkText() }
                </Button>
            </span>
            )
        }
    }
    _deleteMohFile = () => {
        const { formatMessage } = this.props.intl
        const me = this

        if (this.state.selectedRowKeys.length) {
            Modal.confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4273"}, {0: this._getSelectedItems()})}} ></span>,
                onOk() {
                    me._batchDelete()
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name,
            1: formatMessage({id: "LANG671"})
        })

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        const formItemDownloadLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        const me = this
        const uploadType = this.state.uploadType

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
            },
            selectedRowKeys: this.state.selectedRowKeys,
            getCheckboxProps: record => ({
                disabled: record.n === 'ring_back.gsm' && me.state.mohClass === 'guimohdir_ringbacktone_default'
            })
        }

        const pagination = {
            total: this.state.mohList.length,
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
            action: baseServerURl + 'action=uploadfile&type=moh&data=' + this.state.mohClass,
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
                    me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG1409"})})
                    // me.setState({upgradeLoading: false})
                    me.setState({
                        upgradeLoading: false
                    })
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
                            me._getMohList(me.state.mohClass)
                            me._handleCancelList()
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2797" })}}></span>)
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
                    me.setState({
                        upgradeLoading: true
                    })
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                    me.setState({
                        upgradeLoading: true
                    })
                }
            },
            onRemove() {
                me.props.setSpinLoading({loading: false})
                message.destroy()
            },
            beforeUpload: me._checkFormat
        }

        const props_tar = {
            name: 'file',
            action: baseServerURl + 'action=uploadfile&type=moh',
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
                    me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG1409"})})
                    // me.setState({upgradeLoading: false})
                    me.setState({
                        upgradeLoading: false
                    })
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
                            me._getMohList()
                            me._getNameList()
                            me._handleCancelList()
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
                    me.setState({
                        upgradeLoading: true
                    })
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                    me.setState({
                        upgradeLoading: true
                    })
                }
            },
            onRemove() {
                me.props.setSpinLoading({loading: false})
                message.destroy()
            },
            beforeUpload: me._checkFormatTar
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG671"}) } isDisplay='hidden' />
                <div className="content">
                    <div className="top-button">
                        <Button
                            type="primary"
                            icon="create"
                            size='default'
                            onClick={ this._add }>
                            { formatMessage({id: "LANG774" }) }
                        </Button>
                        <Button
                            type="primary"
                            icon="download"
                            size='default'
                            onClick={ this._download }>
                            { formatMessage({id: "LANG741"}, {0: formatMessage({id: "LANG27"})}) }
                        </Button>
                    </div>
                    <Form>
                        <Row>
                            <Col span={16}>
                                <FormItem
                                    id="moh_classes"
                                    { ...formItemLayout }
                                    label={formatMessage({id: "LANG1603"})}>
                                    { getFieldDecorator('moh_classes', {
                                        rules: [],
                                        initialValue: "default"
                                    })(
                                        <Select style={{ width: '60%', marginRight: 8 }} onSelect={this._onChange} >
                                            {
                                               this.state.classData.map(function(it) {
                                                const val = it.val
                                                const text = it.text

                                                return <Option key={ val } value={ val }>
                                                       { text ? text : val }
                                                    </Option>
                                                })
                                           }
                                        </Select>
                                    )}
                                    <span className="sprite sprite-edit" title={ formatMessage({ id: "LANG738"})} style={{position: "relative", top: "5px"}} onClick={this._edit}></span>
                                    <Popconfirm
                                        className={ this.state.disabledDeleteMoh ? 'hidden' : 'display-inline' }
                                        title={ formatMessage({id: "LANG841"}) }
                                        okText={ formatMessage({id: "LANG727"}) }
                                        cancelText={ formatMessage({id: "LANG726"}) }
                                        onConfirm={ this._delete.bind(this) }
                                    >
                                        <span className={ this.state.delStyle } disabled={ this.state.disabledDeleteMoh} title={ formatMessage({ id: "LANG739"})} style={{position: "relative", top: "5px"}} ></span>
                                    </Popconfirm>
                                </FormItem>
                            </Col>
                            <Col span={8}>
                            </Col>
                        </Row>
                    </Form>
                    <div className="content">
                    <div className="top-button">
                        <Button
                            type="primary"
                            icon="record"
                            size='default'
                            onClick={ this._recordNew }>
                            { formatMessage({id: "LANG775" }) }
                        </Button>
                        <Button
                            type="primary"
                            icon="delete"
                            size='default'
                            onClick={ this._deleteMohFile }
                            disabled={ !this.state.selectedRowKeys.length } >
                            { formatMessage({id: "LANG3718"}) }
                        </Button>
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
                        dataSource={ this.state.mohList }
                        pagination={ pagination }
                        showHeader={ !!this.state.mohList.length }
                        className={ this.state.mohList.length ? 'display-block' : 'hidden' }
                    />
                    <div className={ !this.state.mohList.length ? 'display-block' : 'hidden' }>
                        <p>
                            <Row>
                                <Col span={8}>
                                </Col>
                                <Col span={16}>
                                    <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG1605"})}} ></span>
                                </Col>
                            </Row>
                        </p>
                    </div>
                    <Modal
                        title={ this._renderModalTitleList() }
                        visible={ this.state.visibleList }
                        onOk={ this._handleOkList }
                        onCancel={ this._handleCancelList }
                        okText={ this._renderModalOkText() }
                        cancelText={ this._renderModalCancelText() }
                        footer = { this._showFootList() }
                        >
                        <Form>
                            <div ref="recordnew_content" className={ this.state.typeList === "recordNew" ? "display-block" : "hidden" }>
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
                                        initialValue: this.state.extensionList[0] ? this.state.extensionList[0].val : ""
                                    })(
                                        <Select>
                                            {
                                               this.state.extensionList.map(function(it) {
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
                                    label={ formatMessage({id: this.state.typeList === "play" ? "LANG1611" : "LANG1612"}) }>
                                    { getFieldDecorator('playVmenu_ext', {
                                        rules: [],
                                        initialValue: this.state.extensionList[0] ? this.state.extensionList[0].val : ""
                                    })(
                                        <Select>
                                            {
                                               this.state.extensionList.map(function(it) {
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
                            <div ref="upload" className={ this.state.typeList === "upload" ? "display-block" : "hidden" }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG2891" /> }>
                                                <span>{ formatMessage({id: "LANG2891"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}>
                                    { getFieldDecorator('uploadType', {
                                        initialValue: 'moh'
                                    })(
                                        <Select onChange={this._onChangeUploadType} >
                                            <Option key='moh' value='moh'>{ formatMessage({id: "LANG5618"}) }</Option>
                                            <Option key='tar' value='tar'>{ formatMessage({id: "LANG5619"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                                <FormItem
                                    className={ uploadType === 'moh' ? 'display-block' : 'hidden'}
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG5404" /> }>
                                                <span>{ formatMessage({id: "LANG1607"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}>
                                    { getFieldDecorator('upload', {
                                        valuePropName: 'fileList',
                                        normalize: this._normFile
                                    })(
                                        <Upload {...props} >
                                            <Button type="ghost">
                                                <Icon type="upload" /> { formatMessage({id: "LANG1607"}) }
                                            </Button>
                                        </Upload>
                                    ) }
                                </FormItem>
                                <FormItem
                                    className={ uploadType === 'tar' ? 'display-block' : 'hidden'}
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG5404" /> }>
                                                <span>{ formatMessage({id: "LANG1607"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}>
                                    { getFieldDecorator('upload_tar', {
                                        valuePropName: 'fileList',
                                        normalize: this._normFile
                                    })(
                                        <Upload {...props_tar}>
                                            <Button type="ghost">
                                                <Icon type="upload" /> { formatMessage({id: "LANG1607"}) }
                                            </Button>
                                        </Upload>
                                    ) }
                                </FormItem>
                                <span>{formatMessage({id: "LANG672"})}</span>
                                <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4227"})}} ></span>
                            </div>
                        </Form>
                    </Modal>
                </div>
                    <Modal
                        title={ this._renderModalTitle() }
                        visible={this.state.visible}
                        onOk={this._handleOk}
                        onCancel={this._handleCancel}
                        okText={this.state.type !== "downloadAllMOH" ? formatMessage({id: "LANG728"}) : formatMessage({id: "LANG759"})}
                        cancelText={formatMessage({id: "LANG726"})}
                        footer={ this._showFoot() }
                        >
                        <Form>
                            <div ref="add_edit_content" className={ this.state.type !== "downloadAllMOH" ? "display-block" : "hidden" }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1602" /> }>
                                            <span>{formatMessage({id: "LANG135"})}</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('moh_name', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.type === "add",
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.type === "add" ? Validator.minlength(data, value, callback, formatMessage, 2) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.type === "add" ? Validator.letterDigitUndHyphen(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                let errMsg = formatMessage({
                                                    id: "LANG270"
                                                }, {
                                                    0: formatMessage({id: "LANG1603"})
                                                })
                                                this.state.type === "add" ? this._mohNameIsExist(data, value, callback, errMsg) : callback()
                                            }
                                        }],
                                        initialValue: this.state.type === "add" ? "" : (this.state.mohClass === "" ? "default" : this.state.mohClass.split("guimohdir_")[1])
                                    })(
                                        <Input minLength="2" maxLength="20" disabled={ this.state.type === "add" ? false : true } />
                                    )}
                                </FormItem>
                                <FormItem
                                    id="congestioncountfield"
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2507" /> }>
                                            <span>{formatMessage({id: "LANG2507"})}</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('sort', {
                                        rules: [],
                                        initialValue: this.state.type === "add" ? "random" : this.state.moh.sort
                                    })(
                                        <Select>
                                            <Option value='random'>{formatMessage({id: "LANG1201"})}</Option>
                                            <Option value='alpha'>{formatMessage({id: "LANG2506"})}</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </div>
                            <div ref="downloadAll_content" className={ this.state.type === "downloadAllMOH" ? "display-block" : "hidden" }>
                                <FormItem
                                    { ...formItemDownloadLayout }
                                    label={formatMessage({id: "LANG572"})}>
                                    { getFieldDecorator('downloadAll_name', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.type === "downloadAllMOH",
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.type === "downloadAllMOH" ? Validator.letterDigitUndHyphen(data, value, callback, formatMessage) : callback()
                                            }
                                        }],
                                        initialValue: this.state.downloadAllName
                                    })(
                                        <Input maxLength="32" />
                                    )}
                                </FormItem>
                            </div>
                        </Form>
                    </Modal>
                </div>
            </div>
        )
    }
}

MusicOnHold.propTypes = {
}

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(MusicOnHold)))

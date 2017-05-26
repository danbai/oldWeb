'use strict'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'
import $ from 'jquery'
import api from "../../api/api"
import _ from 'underscore'
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Tooltip, Button, message, Modal, Popconfirm, Progress, Table, Tag, Form, Input, Row, Col, Upload, Icon } from 'antd'
import cookie from 'react-cookie'
import Validator from "../../api/validator"

const confirm = Modal.confirm
const FormItem = Form.Item
const Search = Input.Search

window.faxSendingAutoRefresh = null

class FaxSending extends Component {
    constructor(props) {
        super(props)
        this.state = {
            faxItem: [],
            selectedRows: [],
            selectedRowKeys: [],
            callee: '',
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            loading: false,
            sorter: {},
            upgradeLoading: true
        }
    }
    componentDidMount() {
         window.faxSendingAutoRefresh = setInterval(this._refreshFaxSendStatus, 3000)
         this._getInitData()
    }
    componentWillUnmount() {
        clearInterval(window.faxSendingAutoRefresh)
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: []
        })
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
                "action": "deleteFaxRecords",
                "key": record.key
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    if (this.state.callee === '') {
                        const pagination = this.state.pagination
                        const pageSize = this.state.pagination.pageSize
                        let current = this.state.pagination.current
                        const old_total = this.state.pagination.total
                        const new_total = old_total - 1
                        const new_total_page = (new_total - 1) / pageSize + 1
                        if (current > new_total_page) {
                            current = Math.floor(new_total_page)
                        }
                        pagination.current = current

                        this._getInitData({
                            item_num: pageSize,
                            page: current,
                            sidx: this.state.sorter.field ? this.state.sorter.field : 'd',
                            sord: this.state.sorter.order === "ascend" ? "asc" : "desc"
                        })
                        this.setState({
                            pagination: pagination
                        })
                    } else {
                        const pagination = this.state.pagination
                        const pageSize = this.state.pagination.pageSize
                        let current = this.state.pagination.current
                        const old_total = this.state.pagination.total
                        const new_total = old_total - 1
                        const new_total_page = (new_total - 1) / pageSize + 1
                        if (current > new_total_page) {
                            current = Math.floor(new_total_page)
                        }
                        pagination.current = current

                        this._getSendFax({
                            item_num: pageSize,
                            page: current,
                            sidx: this.state.sorter.field ? this.state.sorter.field : 'd',
                            sord: this.state.sorter.order === "ascend" ? "asc" : "desc"
                        }, 1)
                        this.setState({
                            pagination: pagination
                        })
                    }
                    this._clearSelectRows()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _refreshFaxSendStatus = () => {
        const pagination = this.state.pagination

        let sorter_here = {}

        sorter_here = this.state.sorter

        let isCallee = 0
        if (this.state.callee === '') {
            isCallee = 0
        } else {
            isCallee = 1
        }

        this._getSendFax({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'd',
            sord: sorter_here.order === "ascend" ? "asc" : "desc"
        }, isCallee)
    }
    _handleTableChange = (pagination, filters, sorter) => {
        const pager = this.state.pagination

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
        let isCallee = 0
        if (this.state.callee === '') {
            isCallee = 0
        } else {
            isCallee = 1
        }

        this._getSendFax({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'd',
            sord: sorter_here.order === "ascend" ? "asc" : "desc",
            ...filters
        }, isCallee)
    }
    _getSendFax = (
        params = {                
                item_num: 10,
                sidx: "d",
                sord: "desc",
                page: 1 
            }, isCallee = 0) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        // this.setState({loading: true})

        let callee = this.state.callee
        let action = {}
        action.action = 'listSendFaxstatus'
        action.username = localStorage.username
        if (isCallee === 0) {
            callee = ''
        } else if (isCallee === 1) {
            callee = getFieldValue('callee')
            if (callee && callee !== "") {
                action.callee = callee
            }
        }
        _.extend(action, params)
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: action,
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const fax = response.fax || []
                    const pagination = this.state.pagination
                    // Read total count from server
                    pagination.total = res.response.total_item
                    pagination.current = params.page

                    this.setState({
                        loading: false,
                        faxItem: fax,
                        callee: callee,
                        pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getInitData = (params) => {
        this._getSendFax(params, 0)
    }
    _searchFile = () => {
        this._getSendFax({                
                item_num: 10,
                sidx: "d",
                sord: "desc",
                page: 1 
            }, 1)
    }
    _showAll = () => {
        this._getSendFax()
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ 
            selectedRowKeys: selectedRowKeys,
            selectedRows: selectedRows
        })
    }
    _deleteAllSelectdOK = () => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4763" })}}></span>

        message.loading(loadingMessage)
        let faxKeysList = this.state.selectedRowKeys || []
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "deleteFaxRecords",
                "key": faxKeysList.join(',')
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    const pagination = this.state.pagination
                    const pageSize = this.state.pagination.pageSize
                    let current = this.state.pagination.current
                    const old_total = this.state.pagination.total
                    const new_total = old_total - faxKeysList.length
                    const new_total_page = (new_total - faxKeysList.length) / pageSize + 1
                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }
                    pagination.current = current

                    this._getInitData({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'd',
                        sord: this.state.sorter.order === "ascend" ? "asc" : "desc"
                    })
                    this.setState({
                        pagination: pagination
                    })
                    this._clearSelectRows()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _deleteAllSelectd = () => {
        const { formatMessage } = this.props.intl
        const __this = this
        if (this.state.faxItem.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG4064"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else if (this.state.selectedRowKeys.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG823"}, {0: formatMessage({id: "LANG4064"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            let selectedNames = []
            let selectedRows = this.state.selectedRows || []
            selectedRows.map(function(item) {
                selectedNames.push(item.n)
            })
            confirm({
                title: (formatMessage({id: "LANG543"})),
                content: <span dangerouslySetInnerHTML=
                                {{__html: formatMessage({id: "LANG818"}, {0: selectedNames.join('  ')})}}
                            ></span>,
                onOk() {
                    __this._deleteAllSelectdOK()
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _deleteAllOK = () => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4763" })}}></span>

        let username = localStorage.username

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "deleteFaxRecords",
                "username": username
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    const pagination = this.state.pagination
                    const pageSize = this.state.pagination.pageSize
                    let current = this.state.pagination.current
                    const old_total = this.state.pagination.total
                    const new_total = old_total - 1
                    const new_total_page = (new_total - 1) / pageSize + 1
                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }
                    pagination.current = current

                    this._getSendFax({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'd',
                        sord: this.state.sorter.order === "ascend" ? "asc" : "desc"
                    }, 1)
                    this.setState({
                        pagination: pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _deleteAll = () => {
        const { formatMessage } = this.props.intl
        const __this = this
        if (this.state.faxItem.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG4064"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            confirm({
                title: (formatMessage({id: "LANG543"})),
                content: <span dangerouslySetInnerHTML=
                                {{__html: formatMessage({id: "LANG2794"})}}
                            ></span>,
                onOk() {
                    __this._deleteAllOK()
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _createSendstatus = (text, record, index) => {
        if (record.send_status) {
            return <span>{ record.send_status }</span>
        } else {
            return <span>{ formatMessage({id: "LANG2403"}) }</span>
        }
    }
    _createCallee = (text, record, index) => {
        if (record.callee) {
            return <span>{ record.callee }</span>
        } else {
            return <span>{ formatMessage({id: "LANG2403"}) }</span>
        }
    }
    _createUsername = (text, record, index) => {
        if (record.username) {
            return <span>{ record.username }</span>
        } else {
            return <span>{ formatMessage({id: "LANG2403"}) }</span>
        }
    }
    _createProcess = (text, record, index) => {
        const { formatMessage } = this.props.intl
        if (text === 100) {
            return <span title={ formatMessage({id: "LANG4125"}) }><Progress percent={100} /></span>
        } else if (text >= 0 && text <= 99) {
            return <span><Progress percent={text} status="active" /></span>
        } else {
            return <span title={ formatMessage({id: "LANG4089"}) }><Progress percent={50} status="exception" /></span>
        }
    }
    _sendCancel = () => {
        browserHistory.push('/value-added-features/faxSending')
    }
    _sendFax = () => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4763" })}}></span>

        const timestamp = Date.parse(new Date()) + ""

        let id = getFieldValue("faxNum")
        let key = parseInt(timestamp.slice(7))
        $.ajax({
            url: api.apiHost + "action=uploadfile&type=SendFAX&id=" + id + '&key=' + key,
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._getInitData()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _hasFaxNum = (file) => {
        const { formatMessage } = this.props.intl
        let returnValue = false
        let hasValue = false
        let isType = false

        let type = file.type
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                hasValue = true
            } else {
                // message.error(formatMessage({id: "LANG2157"}))
                return false
            }
        })
        const tmp_fname = file.name.toLowerCase()
        if (!/^[a-zA-Z0-9_\-\.]+$/g.test(tmp_fname)) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4128"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            if (file.type === 'application/pdf' ||
                file.type === 'image/tif' ||
                file.type === 'image/tiff') {
                isType = true
            } else {
                Modal.warning({
                    content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4062"})}} ></span>,
                    okText: (formatMessage({id: "LANG727"}))
                })
            }
        }
        if (hasValue && isType) {
            returnValue = true
        }
        return returnValue
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
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
                key: 'username',
                dataIndex: 'username',
                title: formatMessage({id: "LANG2056"}),
                sorter: true
            }, {
                key: 'callee',
                dataIndex: 'callee',
                title: formatMessage({id: "LANG4065"}),
                sorter: true
            }, {
                key: 'send_status',
                dataIndex: 'send_status',
                title: formatMessage({id: "LANG5199"}),
                sorter: true,
                render: (text, record, index) => (
                    this._createSendstatus(text, record, index)
                )
            }, {
                key: 'process',
                dataIndex: 'process',
                title: formatMessage({id: "LANG4087"}),
                sorter: true,
                render: (text, record, index) => (
                    this._createProcess(text, record, index)
                )
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
                                onConfirm={ this._delete.bind(this, record) }
                            >
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                        </div>
                }
            }]
        const pagination = {
                total: this.state.faxItem.length,
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
                    1: formatMessage({id: "LANG4067"})
                })
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        const me = this
        const timestamp = Date.parse(new Date()) + ""

        let id = getFieldValue("faxNum")
        let key = parseInt(timestamp.slice(7))

        const props_file = {
            name: 'file',
            action: api.apiHost + "action=uploadfile&type=SendFAX&id=" + id + '&key=' + key,
            showUploadList: false,
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                // console.log(info.file.status)
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList)
                }
                if (me.state.upgradeLoading) {
                    // me.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG1409"})})
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

                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (data.status === -59) {
                            message.error(formatMessage({id: "LANG4306"}))
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
                // me.props.setSpinLoading({loading: false})
                message.destroy()
            },
            beforeUpload: me._hasFaxNum
        }
        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG4067"}) }
                    isDisplay= "hidden"
                />
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_faxNum"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4065" />}>
                                    <span>{formatMessage({id: "LANG4065"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('faxNum', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.faxNumber(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 32)
                                    }
                                }],
                                width: 100
                            })(
                                <Input maxLength='32' />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_fileUrl"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4095" />}>
                                    <span>{formatMessage({id: "LANG4064"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('fileUrl', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...props_file}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> { formatMessage({id: "LANG1607"}) }
                                    </Button>
                                </Upload>
                            ) }
                        </FormItem>
                        <Row className='hidden' >
                            <Col span={3} >
                                <Button
                                    icon="cancel"
                                    type="primary"
                                    size='default'
                                    onClick={ this._sendCancel }
                                >
                                    { formatMessage({id: "LANG726"}) }
                                </Button>
                            </Col>
                            <Col span={3} >
                                <Button
                                    icon="search"
                                    type="primary"
                                    size='default'
                                    onClick={ this._sendFax }
                                >       
                                    { formatMessage({id: "LANG4068"}) }
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <div className="content">
                    <div className="section-title">
                        <p><span>
                                { formatMessage({id: "LANG4086" })}
                            </span>
                        </p>
                    </div>
                    <div className="top-button">
                        <Row>
                            <Col span={ 12 } >
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    onClick={ this._deleteAllSelectd }
                                >
                                    { formatMessage({id: "LANG3872"}, {0: formatMessage({id: "LANG4146"})}) }
                                </Button>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    onClick={ this._deleteAll }
                                >
                                    { formatMessage({id: "LANG740"}) }
                                </Button>
                            </Col>
                            <Col span={ 8 } className="right-nav">
                                <FormItem
                                    ref="div_callee"
                                >
                                    { getFieldDecorator('callee', {
                                        rules: [],
                                        initialValue: ""
                                    })(
                                        <Input maxLength='127'
                                            placeholder={ formatMessage({id: "LANG4065"}) }
                                            onPressEnter={ this._searchFile }
                                        />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={3} offset={1}>
                                <Button
                                    icon="search"
                                    type="primary"
                                    size='default'
                                    onClick={ this._searchFile }
                                    title={ formatMessage({id: "LANG4065"}) }
                                >
                                    { formatMessage({id: "LANG803"}) }
                                </Button>
                            </Col>
                        </Row>
                    </div>
                    <Table
                        rowKey="key"
                        columns={ columns }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.faxItem }
                        showHeader={ !!this.state.faxItem.length }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                    />
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

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(FaxSending)))

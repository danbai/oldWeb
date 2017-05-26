'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Button, Checkbox, Col, Form, Input, Icon, message, Modal, Popconfirm, Row, Spin, Table, Tooltip, Upload } from 'antd'

const FormItem = Form.Item

class InboundBlackList extends Component {
    constructor(props) {
        super(props)

        this.state = {
            sorter: {},
            loading: false,
            settings: {},
            blacklist: [],
            AllBlacklist: [],
            uploadErrObj: {
                "1": "LANG890",
                "2": "LANG891",
                "3": "LANG892",
                "4": "LANG893",
                "5": "LANG894",
                "6": "LANG895",
                "7": "LANG896",
                "8": "LANG897",
                "9": "LANG898",
                "10": "LANG899"
            },
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            }
        }
    }
    componentDidMount() {
        this._getInboundBlacklist()
        this._getAllInboundBlacklist()
        this._getInboundBlacklistSettings()
    }
    _addBlackList = (e) => {
        // e.preventDefault()

        let action = {}
        let form = this.props.form
        let { formatMessage } = this.props.intl

        let loadingMessage = <span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG826" }) }}></span>
        let successMessage = <span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG4764" }) }}></span>

        form.validateFields(['new_number'], { force: true }, (err, values) => {
            if (!err) {
                let action = {
                        number: values.new_number,
                        action: 'addInboundBlacklist'
                    }

                message.loading(loadingMessage, 0)

                $.ajax({
                    data: action,
                    type: 'post',
                    url: api.apiHost,
                    error: function(e) {
                        message.destroy()
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            form.setFieldsValue({
                                new_number: ''
                            })

                            let pagination = this.state.pagination
                            let pageSize = pagination.pageSize
                            let current = pagination.current

                            this._getInboundBlacklist({
                                page: current ? current : 1,
                                item_num: pageSize ? pageSize : 10,
                                sord: this.state.sorter.order === 'descend' ? 'desc' : 'asc',
                                sidx: this.state.sorter.field ? this.state.sorter.field : 'number'
                            })

                            this._getAllInboundBlacklist()
                        }
                    }.bind(this)
                })
            }
        })
    }
    _checkConflict = (rule, value, callback) => {
        let conflict
        let val = $.trim(value)
        const { formatMessage } = this.props.intl

        conflict = _.find(this.state.AllBlacklist, function(data) {
            return data.number === val
        })

        if (val && conflict) {
            callback(formatMessage({id: "LANG2285"}))
        } else {
            callback()
        }
    }
    _checkFile = (type, msg, file) => {
        const { formatMessage } = this.props.intl

        let filename = file.name

        filename = filename.toLowerCase()

        if (filename.slice(-type.length) !== type) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG911"}, {0: type, 1: formatMessage({id: msg})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })

            return false
        } else {
            return true
        }
    }
    _deleteBlackList = (record) => {
        let action = {}
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG819" })}}></span>

        message.loading(loadingMessage)

        action = {
            'number': record.number,
            'action': 'deleteInboundBlacklist'
        }

        $.ajax({
            data: action,
            type: 'post',
            url: api.apiHost,
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

                    this._getInboundBlacklist({
                        page: current ? current : 1,
                        item_num: pageSize ? pageSize : 10,
                        sord: this.state.sorter.order === 'descend' ? 'desc' : 'asc',
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'number'
                    })

                    this._getAllInboundBlacklist()

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
    _getInboundBlacklist = (params = {
            page: 1,
            item_num: 10,
            sord: 'asc',
            sidx: 'number'
        }) => {
            let blacklist = []
            let { formatMessage } = this.props.intl

            this.setState({
                loading: true
            })

            $.ajax({
                type: 'post',
                url: api.apiHost,
                data: {
                    action: 'listInboundBlacklist',
                    ...params
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        let pagination = this.state.pagination

                        // Read total count from server
                        pagination.total = response.total_item

                        blacklist = response.number || []

                        blacklist = _.map(blacklist, function(data, index) {
                            data.key = index

                            return data
                        })

                        this.setState({
                            loading: false,
                            blacklist: blacklist,
                            pagination
                        })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
    }
    _getAllInboundBlacklist = () => {
        let form = this.props.form
        let { formatMessage } = this.props.intl

        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'listInboundBlacklist'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    this.setState({
                        AllBlacklist: response.number || []
                    })

                    let newNumber = form.getFieldValue('new_number')

                    if (newNumber) {
                        form.validateFields(['new_number'], { force: true })
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getInboundBlacklistSettings = () => {
        let settings = {}
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'post',
            url: api.apiHost,
            data: {
                action: 'getInboundBlacklistSettings'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    settings = response.inbound_blacklist_settings || {}

                    this.setState({
                        settings: settings
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = (e) => {
        browserHistory.push(this.props.params.trunkId ? ('/extension-trunk/inboundRoute/' + this.props.params.trunkId) : '/extension-trunk/inboundRoute')
    }
    _handleSubmit = (e) => {
        // e.preventDefault()

        let loadingMessage = ''
        let successMessage = ''
        const form = this.props.form
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        form.validateFieldsAndScroll(['enable'], (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                values.enable = values.enable ? 'yes' : 'no'
                values.action = 'updateInboundBlacklistSettings'

                $.ajax({
                    data: values,
                    type: 'post',
                    url: api.apiHost,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            this._handleCancel()
                        }
                    }.bind(this)
                })
            }
        })
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

        this._getInboundBlacklist({
            page: pagination.current,
            item_num: pagination.pageSize,
            sidx: sorter_here.field ? sorter_here.field : 'number',
            sord: sorter_here.order === 'descend' ? 'desc' : 'asc',
            ...filters
        })
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const settings = this.state.settings || {}
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemSpecialLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
        }

        const formItemRowLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        }

        const columns = [{
                width: 100,
                sorter: true,
                key: 'number',
                dataIndex: 'number',
                title: formatMessage({id: "LANG4342"})
            }, {
                width: 50,
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._deleteBlackList.bind(this, record) }
                            >
                                <span className="sprite sprite-del"></span>
                            </Popconfirm>
                        </div>
                }
            }]

        const pagination = {
                showSizeChanger: true,
                total: this.state.blacklist.length,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                },
                showTotal: (total) => {
                    return formatMessage({ id: "LANG115" }) + total
                }
            }

        const uploadProps = {
            name: 'file',
            showUploadList: false,
            headers: { authorization: 'authorization-text' },
            beforeUpload: this._checkFile.bind(this, "csv", "LANG3499"),
            action: api.apiHost + 'action=uploadfile&type=importInboundBlacklist',
            onChange: (info) => {
                console.log(info.file.status)

                this.props.setSpinLoading({ loading: true, tip: formatMessage({id: "LANG905"}) })

                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response
                    let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                    this.props.setSpinLoading({ loading: false })

                    if (bool) {
                        if (data.response && data.response.hasOwnProperty('result')) {
                            if (data.response.result === 0) {
                                message.success(<span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG2797" }) }}></span>)

                                let pagination = this.state.pagination
                                let pageSize = pagination.pageSize
                                let current = pagination.current

                                this._getInboundBlacklist({
                                    page: current ? current : 1,
                                    item_num: pageSize ? pageSize : 10,
                                    sord: this.state.sorter.order === 'descend' ? 'desc' : 'asc',
                                    sidx: this.state.sorter.field ? this.state.sorter.field : 'number'
                                })

                                this._getAllInboundBlacklist()
                            } else if (data.response.result === -1) {
                                message.error(formatMessage({id: "LANG3204"}))
                            } else {
                                let messageText = formatMessage({id: "LANG3165"})

                                if (parseInt(data.response.result) < 0) {
                                    messageText = formatMessage({id: this.state.uploadErrObj[Math.abs(parseInt(data.response.result)).toString()]})
                                } else if (parseInt(data.response.result) === 4) {
                                    messageText = formatMessage({id: "LANG915"})
                                } else if (data.response.body) {
                                    messageText = data.response.body
                                }

                                message.error(messageText)
                            }
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                }

                if (info.file.status === 'error') {
                    this.props.setSpinLoading({ loading: false })

                    // message.error(`${info.file.name} file upload failed.`)
                    message.error(formatMessage({id: "LANG916"}))
                }
            }
        }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG2316"})
                })

        return (
            <div className="app-content-main">
                <Title
                    isDisplay='display-block'
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    headerTitle={ formatMessage({id: "LANG2316"}) }
                />
                <div className="content">
                    <Form>
                        <div className="function-description">
                            <span>{ formatMessage({id: "LANG2291"}) }</span>
                        </div>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2288" /> }>
                                        <span>{ formatMessage({id: "LANG2292"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('enable', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: settings.enable ? (settings.enable === 'yes') : false
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG2277"}) }</span>
                        </div>
                        <Row className="row-section-content">
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3500" /> }>
                                            <span>{ formatMessage({id: "LANG3499"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('upload', {
                                    valuePropName: 'fileList',
                                    normalize: this._normFile
                                })(
                                    <Upload {...uploadProps}>
                                        <Button type="ghost">
                                            <Icon type="upload" />{ formatMessage({id: "LANG1607"}) }
                                        </Button>
                                    </Upload>
                                ) }
                            </FormItem>
                            <Row>
                                <Col span={ 12 }>
                                    <FormItem
                                        { ...formItemSpecialLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG2287" /> }>
                                                    <span>{ formatMessage({id: "LANG2283"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('new_number', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.maxlength(data, value, callback, formatMessage, 32)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.alphanumericStarPlusPound(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: this._checkConflict
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 12 }>
                                    <FormItem>
                                        <Button
                                            icon="plus"
                                            type="primary"
                                            shape="circle"
                                            onClick={ this._addBlackList }
                                            style={{ 'margin-left': '10px' }}
                                        />
                                    </FormItem>
                                </Col>
                            </Row>
                            <FormItem
                                { ...formItemRowLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2289" /> }>
                                            <span>{ formatMessage({id: "LANG2280"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                <Table
                                    rowKey="key"
                                    columns={ columns }
                                    loading={ this.state.loading }
                                    dataSource={ this.state.blacklist }
                                    pagination={ this.state.pagination }
                                    onChange={ this._handleTableChange }
                                />
                            </FormItem>
                        </Row>
                    </Form>
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

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(InboundBlackList)))
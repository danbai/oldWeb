'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag, Form, Input, Row, Col} from 'antd'

const FormItem = Form.Item

class UserFax extends Component {
    constructor(props) {
        super(props)
        this.state = {
            faxItem: [],
            faxFileItem: [],
            selectedRowKeysFile: [],
            pagination_file: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            loading: false,
            file_keyword: ""
        }
    }
    componentDidMount() {
        this._getFaxFile()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _clearSelectRowsFile = () => {
        this.setState({
            selectedRowKeysFile: []
        })
    }
    _delete_file = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4763" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "removeFile",
                "type": "fax",
                "data": record.n
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)
                    this._getFaxFile()
                    this._clearSelectRowsFile()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _download_file = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        let fileName = record.n
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG961" })}}></span>

        message.loading(loadingMessage, 0)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "checkFile",
                "type": "fax",
                "data": fileName
            },
            type: 'json',
            async: true,
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    window.open("/cgi?action=downloadFile&type=fax&data=" + fileName, '_self')
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
    _getFaxFile = (
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
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listFile',
                type: 'fax',
                filter: '{"list_dir":0,"list_file":1,"file_keyword":""}',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const fax = response.fax || []
                    const pagination_file = this.state.pagination_file
                    pagination_file.total = response.total_item

                    this.setState({
                        file_keyword: "",
                        loading: false,
                        faxFileItem: fax,
                        pagination_file
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleTableChangeFile = (pagination_file, filters, sorter) => {
        const pager = this.state.pagination_file

        pager.current = pagination_file.current

        this.setState({
            pagination_file: pager
        })

        this._getFaxFile({
            item_num: pagination_file.pageSize,
            page: pagination_file.current,
            sidx: sorter.field ? sorter.field : "d",
            sord: sorter.order === "ascend" ? "asc" : "desc",
            ...filters
        })
    }
    _onSelectChangeFile = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        console.log('selectedRow changed: ', selectedRows)

        this.setState({
            selectedRowKeysFile: selectedRowKeys
        })
    }
    _createOptions = (record) => {
        const { formatMessage } = this.props.intl

        return (
            <div>
                <span className="sprite sprite-download" onClick={ this._download_file.bind(this, record) }></span>
                <Popconfirm
                    title={ formatMessage({id: "LANG841"}) }
                    okText={ formatMessage({id: "LANG727"}) }
                    cancelText={ formatMessage({id: "LANG726"}) }
                    onConfirm={ this._delete_file.bind(this, record) }
                >
                    <span className="sprite sprite-del" ></span>
                </Popconfirm>
            </div>
        )
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const columns_file = [{
                key: 'n',
                dataIndex: 'n',
                title: formatMessage({id: "LANG135"}),
                sorter: (a, b) => a.n.length - b.n.length
            }, {
                key: 'd',
                dataIndex: 'd',
                title: formatMessage({id: "LANG203"}),
                sorter: (a, b) => a.d.length - b.d.length
            }, {
                key: 's',
                dataIndex: 's',
                title: formatMessage({id: "LANG2257"}),
                sorter: (a, b) => a.s.length - b.s.length
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return this._createOptions(record)
                }
            }]
        const pagination_file = {
                total: this.state.faxFileItem.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }
        const rowSelection_file = {
                onChange: this._onSelectChangeFile,
                selectedRowKeys: this.state.selectedRowKeysFile
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG614"})
                })
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG2988"}) }
                    isDisplay= "hidden"
                />
                <div className="content">
                    <Table
                        rowKey="n"
                        columns={ columns_file }
                        pagination={ this.state.pagination_file }
                        rowSelection={ rowSelection_file }
                        dataSource={ this.state.faxFileItem }
                        showHeader={ !!this.state.faxFileItem.length }
                        loading={ this.state.loading}
                        onChange={ this._handleTableChangeFile }
                    />
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(UserFax))

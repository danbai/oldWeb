'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag, Upload, Icon, Form, Tooltip } from 'antd'

const FormItem = Form.Item

class PinGroups extends Component {
    constructor(props) {
        super(props)

        this.state = {
            postData: {},
            pingroups: [],
            loading: false,
            pagination: {
                defaultPageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: this._showTotal
            },
            upload_visible: false,
            params: {}
        }
    }
    componentDidMount() {
        this._getPinSets()
    }
    _add = () => {
        browserHistory.push('/extension-trunk/outboundRoute/pingroups/add')
    }
    _delete = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            async: true,
            type: 'post',
            url: api.apiHost,
            data: {
                'action': 'deletePinSets',
                'pin_sets_id': record.pin_sets_id
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._reloadTableList(1)
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _edit = (record) => {
        browserHistory.push('/extension-trunk/outboundRoute/pingroups/edit/' + record.pin_sets_id + '/' + record.pin_sets_name)
    }
    _expandedRowRender = (record) => {
        return this._renderRowData(this._getRowData(record))
    }
    _getRowData = (record) => {
        const { formatMessage, formatHTMLMessage } = this.props.intl
        
        let members = []

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                'action': 'getPinSets',
                'pin_sets_id': record.pin_sets_id
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    members = data.response.members
                }
            }.bind(this)
        })

        return members
    }
    _getPinSets = (params = {
            page: 1,
            sord: 'asc',
            item_num: 10,
            sidx: 'pin_sets_id'
        }) => {
            const { formatMessage } = this.props.intl

            let data = {
                    ...params
                }

            data.action = 'listPinSets'

            this.setState({
                loading: true,
                postData: data,
                params: params,
                upload_visible: false
            })

            $.ajax({
                data: data,
                type: 'post',
                url: api.apiHost,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}
                        const pingroups = response.pin_sets_id || []

                        let pager = _.clone(this.state.pagination)

                        // Read total count from server
                        pager.current = data.page
                        pager.total = res.response.total_item

                        this.setState({
                            loading: false,
                            pagination: pager,
                            pingroups: pingroups
                        })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
    }
    _handleTableChange = (pagination, filters, sorter) => {
        let params = {
            ...filters,
            page: pagination.current,
            item_num: pagination.pageSize
        }

        if (sorter.field) {
            params.sidx = sorter.field
            params.sord = sorter.order === 'ascend' ? 'asc' : 'desc'
        } else {
            params.sord = 'asc'
            params.sidx = 'pin_sets_id'
        }

        this._getPinSets(params)
    }
    _reloadTableList = (selectedRowLenth) => {
        let params = _.clone(this.state.postData),
            total = this.state.pagination.total,
            current = this.state.pagination.current,
            pageSize = this.state.pagination.pageSize

        pageSize = pageSize ? pageSize : this.state.pagination.defaultPageSize

        let page = current,
            surplus = total % pageSize,
            totalPage = Math.ceil(total / pageSize),
            lastPageNumber = surplus === 0 ? pageSize : surplus

        if ((totalPage === current) && (totalPage > 1) && (lastPageNumber === selectedRowLenth)) {
            page = current - 1
        }

        params.page = page

        this._getPinSets(params)
    }
    _renderRowData = (members) => {
        const { formatMessage, formatHTMLMessage } = this.props.intl

        const columns = [{
                key: 'pin',
                dataIndex: 'pin',
                title: formatMessage({id: "LANG4555"})
            }, {
                key: 'pin_name',
                dataIndex: 'pin_name',
                title: formatMessage({id: "LANG4556"})
            }]

        return (
            <Table
                columns={ columns }
                pagination={ false }
                dataSource={ members }
            />
        )
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _uploadPinGroup = () => {
        this.setState({
            upload_visible: true
        })
    }
    _uploadOk = () => {
        this.setState({
            upload_visible: false
        })
        this._getPinSets()
    }
    _uploadCancel = () => {
        this.setState({
            upload_visible: false
        })
        this._getPinSets()
    }
    _handleCancel = () => {
        browserHistory.push('/extension-trunk/outboundRoute/')
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                sorter: true,
                key: 'pin_sets_name',
                dataIndex: 'pin_sets_name',
                title: formatMessage({id: "LANG135"})
            }, {
                sorter: true,
                key: 'record_in_cdr',
                dataIndex: 'record_in_cdr',
                title: formatMessage({id: "LANG4559"})
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                onClick={ this._edit.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._delete.bind(this, record) }
                            >
                                <span className="sprite sprite-del"></span>
                            </Popconfirm>
                        </div>
                }
            }]

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG4553"})
                })

        const me = this
        const props = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=importPinGroup',
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

                        if (data.status === 0 && response) {
                            if (response.result === 0) {
                                message.success(formatMessage({id: "LANG906"}))
                                me._getPinSets(this.state.params)
                            } else if (response.result === 1) {
                                message.error(formatMessage({id: "LANG3204"}))
                            } else if (response.result === -1) {
                                message.error(formatMessage({id: "LANG962"}))
                            } else if (response.result === -11) {
                                message.error(formatMessage({id: "LANG270"}, {0: formatMessage({id: "LANG4554"})}))
                            } else if (response.result === -12) {
                                message.error(formatMessage({id: "LANG270"}, {0: formatMessage({id: "LANG4555"})}))
                            } else if (response.result === -13) {
                                message.error(formatMessage({id: "LANG270"}, {0: formatMessage({id: "LANG4556"})}))
                            } else if (response.result === -14) {
                                message.error(formatMessage({id: "LANG4555"}) + formatMessage({id: "LANG2157"}))
                            } else if (response.result === -15) {
                                message.error(formatMessage({id: "LANG4556"}) + formatMessage({id: "LANG2200"}))
                            } else if (response.result === -16) {
                                message.error(formatMessage({id: "LANG4554"}) + formatMessage({id: "LANG2200"}))
                            } else if (response.result === -17) {
                                message.error(formatMessage({id: "LANG4555"}) + formatMessage({id: "LANG2161"}, {0: 4}))
                            } else if (response.result === -18) {
                                message.error(formatMessage({id: "LANG4555"}) + formatMessage({id: "LANG2160"}, {0: 32}))
                            } else if (response.result === -19) {
                                message.error(formatMessage({id: "LANG4556"}) + formatMessage({id: "LANG2161"}, {0: 2}))
                            } else if (response.result === -20) {
                                message.error(formatMessage({id: "LANG4556"}) + formatMessage({id: "LANG2160"}, {0: 32}))
                            } else {
                                message.error(formatMessage({id: "LANG916"}))
                            }
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
                message.destroy()
            }
        }

        const formItemLayout = {
            labelCol: { span: 9 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="app-content-main">
                <Title
                    isDisplay='display-block'
                    isDisplaySubmit="hidden"
                    onCancel={ this._handleCancel }
                    headerTitle={ formatMessage({id: "LANG4553"}) }
                />
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._add }
                        >
                            { formatMessage({id: "LANG769"}) }
                        </Button>
                        <Button
                            type="primary"
                            size='default'
                            onClick={ this._uploadPinGroup }
                        >
                            { formatMessage({id: "LANG1607"}) }
                        </Button>
                        <Modal
                            footer={ null }
                            onOk={ this._uploadOk }
                            onCancel={ this._uploadCancel }
                            visible={ this.state.upload_visible }
                            okText={ formatMessage({id: "LANG727"}) }
                            title={ formatMessage({id: "LANG782"}) }
                            cancelText={ formatMessage({id: "LANG223"}) }
                        >
                            <Form>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG5603" /> }>
                                                <span>{ formatMessage({id: "LANG1607"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}>
                                    <Upload {...props}>
                                        <Button type="ghost">
                                            <Icon type="upload" /> { formatMessage({id: "LANG1607"}) }
                                        </Button>
                                    </Upload>
                                </FormItem>
                            </Form>
                        </Modal>
                    </div>
                    <Table
                        columns={ columns }
                        rowKey="pin_sets_id"
                        loading={ this.state.loading }
                        dataSource={ this.state.pingroups }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        expandedRowRender={ this._expandedRowRender }
                    />
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(PinGroups))
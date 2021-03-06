'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
// import ZEROCONFIG from './parser/ZCDataSource'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Modal, Select, Table, Tabs, Popconfirm } from 'antd'

const confirm = Modal.confirm

class GlobalTemplates extends Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedRows: [],
            showPrepare: true,
            showContent: false,
            globalTemplates: [],
            selectedRowKeys: [],
            pagination: {
                defaultPageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: this._showTotal
            }
        }
    }
    componentDidMount() {
        $(document).ready(() => {
            let ZEROCONFIG = window.ZEROCONFIG
            let { formatMessage } = this.props.intl

            if (!window.ISREFRESHPAGE) {
                ZEROCONFIG.init('', formatMessage, message)

                this._checkReady()
            } else {
                setTimeout(() => {
                    ZEROCONFIG.init('', formatMessage, message)

                    this._checkReady()
                }, 600)
            }
        })
    }
    componentWillUnmount() {
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.activeKey === 'globalTemplates') {
            this._checkReady()
        }
    }
    _batchDeleteGlobalTemplate = () => {
        let { formatMessage } = this.props.intl

        let confirmItemList = []
        let selectedIds = this.state.selectedRowKeys
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>

        _.map(this.state.selectedRows, (data, index) => {
            confirmItemList.push('<font style="float: left; margin-left: 10px; word-break: break-all; text-align: left;">[' + data.id + '] ' + data.name + '</font>')
        })

        let confirmMessage = <span dangerouslySetInnerHTML=
                                        {{ __html: formatMessage({ id: "LANG818" }, {
                                                0: '<br />' + confirmItemList.join('<br />')
                                            })
                                        }}
                                    ></span>

        confirm({
            onCancel: () => {},
            content: confirmMessage,
            onOk: () => {
                let ZEROCONFIG = window.ZEROCONFIG

                message.loading(loadingMessage, 0)

                ZEROCONFIG.connector.deleteTemplate(selectedIds).done((result) => {
                        let bool = UCMGUI.errorHandler(result, null, formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            this._prepareTemplates()
                            this._reloadTableList(selectedIds.length)
                        }
                    })
                    .fail((jqXHR, textStatus, errorThrown) => {})
            }
        })
    }
    _checkReady = () => {
        let BLL = window.BLL
        let ZEROCONFIG = window.ZEROCONFIG
        let { formatMessage } = this.props.intl

        if (ZEROCONFIG.isDataReady() === 1) {
            BLL.DataCollection.prepareGlobalList()

            this._prepareTemplates()
            // this._prepareTemplates(this._listGlobalTemplates)

            ZEROCONFIG.connector.checkZeroConfigInvalidModels($('#invalidModelWarning').html(), true)
        } else {
            let label = $('div#loadingMsgGT'),
                tLocale = 'LANG805'

            if (ZEROCONFIG.isDataReady() === -1) {
                tLocale = 'LANG3717'
            }

            label.text(formatMessage({id: tLocale}))

            setTimeout(this._checkReady, 1000)
        }
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRows: [],
            selectedRowKeys: []
        })
    }
    _createGlobalTemplate() {
        browserHistory.push('/value-added-features/zeroConfig/globalTemplates/add')
    }
    _editGlobalTemplate = (record) => {
        browserHistory.push('/value-added-features/zeroConfig/globalTemplates/edit/' + record.id + '/' + record.name)
    }
    _deleteGlobalTemplate = (record) => {
        let ZEROCONFIG = window.ZEROCONFIG
        let { formatMessage } = this.props.intl

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage, 0)

        ZEROCONFIG.connector.deleteTemplate(record.id).done((result) => {
                let bool = UCMGUI.errorHandler(result, null, formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._prepareTemplates()
                    this._reloadTableList(1)
                }
            })
            .fail((jqXHR, textStatus, errorThrown) => {})
    }
    _handleTableChange = (pagination, filters, sorter) => {
        this.setState({
            pagination: pagination
        })

        this._clearSelectRows()
    }
    _listGlobalTemplates = () => {
        $.ajax({
            async: true,
            type: 'post',
            url: api.apiHost,
            data: {
                template_type: 'global',
                action: 'getAllTemplates'
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        templates = res.templates

                    this.setState({
                        templates: templates
                    })
                }
            }.bind(this)
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        // console.log('selectedRow changed: ', selectedRows)
        console.log('selectedRowKeys changed: ', selectedRowKeys)

        this.setState({ selectedRowKeys, selectedRows })
    }
    _prepareTemplates = (callback) => {
        let ret = []
        let ZEROCONFIG = window.ZEROCONFIG

        // TODO: get template needs to past argument
        ZEROCONFIG.connector.getAllTemplates('global', '').done((result) => {
            if (result.status === 0) {
                ret = result.response.templates
            }

            // TOOD: add error handling when status is not 0

            // callback.call(this, ret)

            this.setState({
                showContent: true,
                showPrepare: false,
                globalTemplates: ret
            })
        }).fail(() => {
            // TODO: add error display here

            console.error('FAIL', arguments)

            // callback.call(this, ret)

            this.setState({
                globalTemplates: ret
            })
        })

        this._clearSelectRows()
    }
    _reloadTableList = (selectedRowLenth) => {
        let pager = _.clone(this.state.pagination),
            total = this.state.pagination.total,
            current = this.state.pagination.current,
            pageSize = this.state.pagination.pageSize

        pageSize = pageSize ? pageSize : this.state.pagination.defaultPageSize

        if (current) {
            let page = current,
                surplus = total % pageSize,
                totalPage = Math.ceil(total / pageSize),
                lastPageNumber = surplus === 0 ? pageSize : surplus

            if ((totalPage === current) && (totalPage > 1) && (lastPageNumber === selectedRowLenth)) {
                page = current - 1
            }

            pager.current = page

            this.setState({
                pagination: pager
            })
        }
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _toggleGlobalTemplate = () => {
        let { formatMessage } = this.props.intl

        let confirmItemList = []
        let selectedIds = this.state.selectedRowKeys
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG844" })}}></span>
        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>

        _.map(this.state.selectedRows, (data, index) => {
            confirmItemList.push('<font style="float: left; margin-left: 10px; word-break: break-all; text-align: left;">[' + data.id + '] ' + data.name + '</font>')
        })

        let confirmMessage = <span dangerouslySetInnerHTML=
                                        {{ __html: formatMessage({ id: "LANG3457" }, {
                                                0: '<br />' + confirmItemList.join('<br />')
                                            })
                                        }}
                                    ></span>

        confirm({
            onCancel: () => {},
            content: confirmMessage,
            onOk: () => {
                let ZEROCONFIG = window.ZEROCONFIG

                message.loading(loadingMessage, 0)

                ZEROCONFIG.connector.toggleTemplateEnable(selectedIds).done((result) => {
                        let bool = UCMGUI.errorHandler(result, null, formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            this._prepareTemplates()
                        }
                    })
                    .fail((jqXHR, textStatus, errorThrown) => {})
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl

        const columns = [
            {
                key: 'name',
                dataIndex: 'name',
                title: formatMessage({id: "LANG3449"}),
                sorter: (a, b) => a.name.length - b.name.length
            }, {
                key: 'description',
                dataIndex: 'description',
                title: formatMessage({id: "LANG3450"}),
                sorter: (a, b) => a.description.length - b.description.length,
                render: (text, record, index) => (
                    text ? text : '--'
                )
            }, {
                key: 'enabled',
                dataIndex: 'enabled',
                title: formatMessage({id: "LANG3061"}),
                sorter: (a, b) => a.enabled - b.enabled,
                render: (text, record, index) => (
                    text
                        ? <span style={{ 'color': 'green' }}>{ formatMessage({id: "LANG136"}) }</span>
                        : <span style={{ 'color': 'red' }}>{ formatMessage({id: "LANG137"}) }</span>
                )
            }, {
                key: 'used',
                dataIndex: 'used',
                title: formatMessage({id: "LANG3453"}),
                sorter: (a, b) => a.used.length - b.used.length,
                render: (text, record, index) => (
                    text ? text : '--'
                )
            }, {
                key: 'last_modified',
                dataIndex: 'last_modified',
                title: formatMessage({id: "LANG3454"}),
                sorter: (a, b) => a.last_modified.length - b.last_modified.length,
                render: (text, record, index) => {
                    let context

                    if (text) {
                        let parts = text.split(' ')

                        if (parts.length === 2) {
                            let dateParts = parts[0].split('-'),
                                timeParts = parts[1].split(':')

                            if (dateParts.length === 3 && timeParts.length === 3) {
                                let date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2])

                                context = date.format("mm/dd/yyyy h:MM TT")
                            } else {
                                context = 'unknown'
                            }
                        } else {
                            context = 'unknown'
                        }
                    }

                    return context
                }
            }, {
                title: formatMessage({id: "LANG74"}),
                dataIndex: '',
                key: 'x',
                render: (text, record, index) => (
                    <div>
                        <span className="sprite sprite-edit" onClick={ this._editGlobalTemplate.bind(this, record) }></span>
                        <Popconfirm
                            title={ formatMessage({id: "LANG841"}) }
                            okText={ formatMessage({id: "LANG727"}) }
                            cancelText={ formatMessage({id: "LANG726"}) }
                            onConfirm={ this._deleteGlobalTemplate.bind(this, record) }
                        >
                            <span className="sprite sprite-del"></span>
                        </Popconfirm>
                    </div>
                )
            }
        ]

        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        return (
            <div className="app-content-main" id="app-content-main">
                <div
                    id="preparePadGT"
                    style={{ 'width': '500px', 'height': '160px' }}
                    className={ this.state.showPrepare ? 'display-block' : 'hidden' }
                >
                    <div style={{ 'marginTop': '60px' }}>
                        <img src="/../../images/ani_loading.gif"/>
                    </div>
                    <div id="loadingMsgGT" style={{ 'textAlign': 'center' }}>{ formatMessage({ id: "LANG805"}) }</div>
                </div>
                <div className={ this.state.showContent ? 'content' : 'hidden' }>
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._createGlobalTemplate }
                        >
                            { formatMessage({id: "LANG769"}) }
                        </Button>
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._batchDeleteGlobalTemplate }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG739"}) }
                        </Button>
                        <Button
                            icon="sync"
                            type="primary"
                            size='default'
                            onClick={ this._toggleGlobalTemplate }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG3448"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="id"
                        columns={ columns }
                        rowSelection={ rowSelection }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        dataSource={ this.state.globalTemplates }
                    />
                </div>
            </div>
        )
    }
}

GlobalTemplates.propTypes = {
}

export default injectIntl(GlobalTemplates)

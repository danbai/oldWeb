'use strict'

import $ from 'jquery'
import React, { Component, PropTypes } from 'react'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select, Table, Popconfirm, Modal, DatePicker, BackTop } from 'antd'
const FormItem = Form.Item
import _ from 'underscore'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'

const Option = Select.Option
const confirm = Modal.confirm

class EmailSendLog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mailSendLog: [],
            infoVisible: false,
            isDisplay: "display-block-filter",
            isDisplaySearch: 'hidden',
            sub_send_mail_log: [],
            search_values: {
                start_date: '',
                end_date: '',
                recipient: '',
                send_result: '',
                return_code: '',
                module: ''
            },
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {},
            loading: false
        }
    }
    componentDidMount() {
        this._getMailSendLog()
    }
    componentWillUnmount() {

    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _hideSearch = () => {
        this.setState({
            isDisplay: 'display-block-filter',
            isDisplaySearch: 'hidden'
        })
    }
    _handleSearch = () => {
        this.setState({
            isDisplay: 'display-block',
            isDisplaySearch: 'display-block'
        })
    }
    _handleCancel = () => {
        const { setFieldsValue} = this.props.form
        setFieldsValue({
            start_date: '',
            end_date: '',
            recipient: '',
            send_result: '',
            return_code: '',
            module: ''
        })
        this._getMailSendLog()
    }
    _infoCancel = () => {
        this.setState({
            infoVisible: false
        })
    }
    _info = (record) => {
        const ID = record.id
        const { formatMessage } = this.props.intl
        let sub_send_mail_log = []
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getSubMailSendLog',
                id: ID
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const tmp_sub_send_mail_log = response.sub_send_mail_log || []
                    tmp_sub_send_mail_log.map(function(item, index) {
                        sub_send_mail_log.push({
                            index: index,
                            msg_id: item.msg_id,
                            send_time: item.send_time,
                            send_to: item.send_to,
                            return_code: item.return_code,
                            send_result: item.send_result
                        })
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            infoVisible: true,
            sub_send_mail_log: sub_send_mail_log
        })
    }
    _searchMailLog = (
        params = {                
            item_num: 10,
            page: 1,
            sord: 'desc',
            sidx: 'date'
        }, click = 1
        ) => {
        const { getFieldValues } = this.props.form
        const { formatMessage } = this.props.intl
        const { form } = this.props
        const values = this.props.form.getFieldsValue()
        this.setState({loading: true})
        let search_values = {}

        let action = {}
        action.action = 'listMailSendLog'
        action.options = 'id,date,module,recipient,send_time,send_to,send_result,return_code'
        if (click === 1) {
            if (values.start_date !== undefined && values.statr_date !== null && values.start_date !== '') {
                action.start_date = values.start_date.format('YYYY-MM-DD HH:mm')
                search_values.start_date = action.start_date
            }
            if (values.end_date !== undefined && values.end_date !== null && values.end_date !== '') {
                action.end_date = values.end_date.format('YYYY-MM-DD HH:mm')
                search_values.end_date = action.end_date
            }
            if (values.recipient !== undefined && values.recipient !== null && values.recipient !== '') {
                action.recipient = values.recipient
                search_values.recipient = action.recipient
            }
            if (values.send_result !== undefined && values.send_result !== null && values.send_result !== '') {
                action.send_result = values.send_result
                search_values.send_result = action.send_result
            }
            if (values.return_code !== undefined && values.return_code !== null && values.return_code !== '') {
                action.return_code = values.return_code
                search_values.return_code = action.return_code
            }
            if (values.module !== undefined && values.module !== null && values.module !== '') {
                action.module = values.module
                search_values.module = action.module
            }
        } else if (click === 0) {
            search_values = this.state.search_values
            for (let item in search_values) {
                if (search_values[item] !== '') {
                    action[item] = search_values[item]
                }
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
                    const mailSendLog = response.mail_send_log || []
                    const pagination = this.state.pagination
                    pagination.total = response.total_item
                    pagination.current = params.page

                    this.setState({
                        loading: false,
                        mailSendLog: mailSendLog,
                        search_values: search_values,
                        pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _deleteAllOk = () => {
        const { formatMessage } = this.props.intl

        let action = {}
        action.action = 'deleteMailSendLogAll'
        message.loading(formatMessage({ id: "LANG826" }), 0)
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: action,
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG819" })}}></span>)
                    this._getMailSendLog()
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
        if (this.state.mailSendLog.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG129"}, {0: formatMessage({id: "LANG5382"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG840"})}} ></span>,
                onOk() {
                   __this._deleteAllOk()
                },
                onCancel() {
                    return
                },
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _showAll = () => {
        this._getMailSendLog()
    }
    _getMailSendLog = (
        params = {                
            item_num: 10,
            page: 1,
            sord: 'desc',
            sidx: 'date'
        }
        ) => {
        const { formatMessage } = this.props.intl
        this.setState({loading: true})

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listMailSendLog',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const mailSendLog = response.mail_send_log || []
                    const pagination = this.state.pagination
                    pagination.total = response.total_item
                    pagination.current = params.page

                    this.setState({
                        loading: false,
                        mailSendLog: mailSendLog,
                        search_values: {},
                        pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleTableChange = (pagination, filters, sorter) => {
        const pager = this.state.pagination

        pager.current = pagination.current

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

        const search_values = this.state.search_values
        let isSearch = false
        for (let item in search_values) {
            if (search_values[item] !== '') {
                isSearch = true
            }
        }
        if (isSearch === false) {
            this._getMailSendLog({
                item_num: pagination.pageSize,
                page: pagination.current,
                sidx: sorter_here.field ? sorter_here.field : "date",
                sord: sorter_here.order === "ascend" ? "asc" : "desc",
                ...filters
            })
        } else {
            this._searchMailLog({
                item_num: pagination.pageSize,
                page: pagination.current,
                sidx: sorter_here.field ? sorter_here.field : "date",
                sord: sorter_here.order === "ascend" ? "asc" : "desc",
                ...filters
            }, 0)
        }
    }
    _handleFormChange = (changedFields) => {
        _.extend(this.props.dataSource, changedFields)
    }
    _createModule = (text, record, index) => {
        const { formatMessage } = this.props.intl
        const moduleLocales = {
            'account': 'LANG85',
            'voicemail': 'LANG20',
            'conference': 'LANG3775',
            'password': 'LANG2810',
            'alert': 'LANG2553',
            'cdr': 'LANG7',
            'fax': 'LANG95',
            'test': 'LANG2273'
        }
        if (moduleLocales[text] !== undefined) {
            return <span>{ formatMessage({id: moduleLocales[text]}) }</span>
        } else {
            return <span>{ text }</span>
        }
    } 
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const sub_send_mail_log = this.state.sub_send_mail_log
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        const columns = [{
                key: 'date',
                dataIndex: 'date',
                title: formatMessage({id: "LANG5383"}),
                width: 100,
                sorter: true
            }, {
                key: 'module',
                dataIndex: 'module',
                title: formatMessage({id: "LANG5384"}),
                width: 100,
                sorter: true,
                render: (text, record, index) => {
                    return this._createModule(text, record, index)
                }
            }, {
                key: 'recipient',
                dataIndex: 'recipient',
                title: formatMessage({id: "LANG5385"}),
                width: 100,
                sorter: true
            }, {
                key: 'send_time',
                dataIndex: 'send_time',
                title: formatMessage({id: "LANG5386"}),
                width: 100,
                sorter: true
            }, {
                key: 'send_to',
                dataIndex: 'send_to',
                title: formatMessage({id: "LANG5387"}),
                width: 100,
                sorter: true
            }, {
                key: 'send_result',
                dataIndex: 'send_result',
                title: formatMessage({id: "LANG5388"}),
                width: 100,
                sorter: true
            }, {
                key: 'return_code',
                dataIndex: 'return_code',
                title: formatMessage({id: "LANG5389"}),
                width: 100,
                sorter: true
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                width: 100,
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG3923"}) }
                                onClick={ this._info.bind(this, record) }>
                            </span>
                        </div>
                }
            }]
        const pagination = {
                total: this.state.mailSendLog.length,
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
        const columns_info = [{
                key: 'index',
                dataIndex: 'index',
                title: 'index',
                className: 'hidden',
                width: 100
            }, {
                key: 'send_time',
                dataIndex: 'send_time',
                title: formatMessage({id: "LANG5392"}),
                width: 100
            }, {
                key: 'send_to',
                dataIndex: 'send_to',
                title: formatMessage({id: "LANG5393"}),
                width: 100
            }, {
                key: 'send_result',
                dataIndex: 'send_result',
                title: formatMessage({id: "LANG5388"}),
                width: 100
            }, {
                key: 'return_code',
                dataIndex: 'return_code',
                title: formatMessage({id: "LANG5389"}),
                width: 100
            }]

    return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <Title
                        headerTitle={ formatMessage({id: "LANG5382"}) }
                        onSubmit={ this._searchMailLog }
                        onCancel={ this._handleCancel } 
                        onSearch = { this._handleSearch } 
                        isDisplay= { this.state.isDisplay }
                        saveTxt = { formatMessage({id: "LANG1288" }) }
                        cancelTxt = { formatMessage({id: "LANG750" }) }
                    />
                    <Form className={ this.state.isDisplaySearch }>
                        <FormItem
                            ref="div_start_date"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG5436" />}>
                                    <span>{formatMessage({id: "LANG1048"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('start_date', {
                                 rules: []
                            })(
                                <DatePicker showTime={{format: 'HH:mm'}} placeholder={ formatMessage({id: "LANG5373"}) } format="YYYY-MM-DD HH:mm" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_end_date"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG5437" />}>
                                    <span>{formatMessage({id: "LANG1049"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('end_date', {
                                 rules: []
                            })(
                                <DatePicker showTime={{format: 'HH:mm'}} placeholder={ formatMessage({id: "LANG5373"}) } format="YYYY-MM-DD HH:mm" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_recipient"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG5438" />}>
                                    <span>{formatMessage({id: "LANG5385"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('recipient', {
                                 rules: [],
                                initialValue: ""
                            })(
                                <Input maxLength="" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_send_result"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG5388" />}>
                                    <span>{formatMessage({id: "LANG5388"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('send_result', {
                                 rules: [],
                                initialValue: ""
                            })(
                                <Input maxLength="" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_return_code"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG5389" />}>
                                    <span>{formatMessage({id: "LANG5389"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('return_code', {
                                 rules: [],
                                initialValue: ""
                            })(
                                <Input maxLength="" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_module"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG5384" />}>
                                    <span>{formatMessage({id: "LANG5384"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('module', {
                                rules: [],
                                initialValue: ""
                            })(
                                <Select>
                                     <Option value="">{formatMessage({id: "LANG4160"})}</Option>
                                     <Option value="account">{formatMessage({id: "LANG85"})}</Option>
                                     <Option value="voicemail">{formatMessage({id: "LANG20"})}</Option>
                                     <Option value="conference">{formatMessage({id: "LANG3775"})}</Option>
                                     <Option value="password">{formatMessage({id: "LANG2810"})}</Option>
                                     <Option value="alert">{formatMessage({id: "LANG2553"})}</Option>
                                     <Option value="cdr">{formatMessage({id: "LANG7"})}</Option>
                                     <Option value="fax">{formatMessage({id: "LANG95"})}</Option>
                                     <Option value="test">{formatMessage({id: "LANG2273"})}</Option>
                                 </Select>
                            ) }
                        </FormItem>
                        <div className="hide_search sprite sprite-slide-bar" onClick={ this._hideSearch }></div>
                    </Form>
                </div>
                <div className="content">
                    <Button type="primary" icon="solution" size='default' onClick={ this._showAll }>
                        { formatMessage({id: "LANG4107"}) }
                    </Button>
                    <Button type="primary" icon="delete" size='default' onClick={ this._deleteAll }>
                        { formatMessage({id: "LANG3911" })}
                    </Button>
                </div>
                <div className="content">
                    <p >
                        <Row>
                            <Col span={ 1 }>
                                <span className="error-code">250</span>
                            </Col>
                            <Col span={ 23 }>
                                <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5421"})}} >
                                </span>
                            </Col>
                        </Row>
                    </p>
                    <p >
                        <Row>
                            <Col span={ 1 }>
                                <span className="error-code">501</span>
                            </Col>
                            <Col span={ 23 }>
                                <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5422"})}} >
                                </span>
                            </Col>
                        </Row>
                    </p>
                    <p >
                        <Row>
                            <Col span={ 1 }>
                                <span className="error-code">535</span>
                            </Col>
                            <Col span={ 23 }>
                                <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5423"})}} >
                                </span>
                            </Col>
                        </Row>
                    </p>
                    <p >
                        <Row>
                            <Col span={ 1 }>
                                <span className="error-code">550</span>
                            </Col>
                            <Col span={ 23 }>
                                <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5424"})}} >
                                </span>
                            </Col>
                        </Row>
                    </p>
                    <p >
                        <Row>
                            <Col span={ 1 }>
                                <span className="error-code">552</span>
                            </Col>
                            <Col span={ 23 }>
                                <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5425"})}} >
                                </span>
                            </Col>
                        </Row>
                    </p>
                    <p >
                        <Row>
                            <Col span={ 1 }>
                                <span className="error-code">553</span>
                            </Col>
                            <Col span={ 23 }>
                                <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5426"})}} >
                                </span>
                            </Col>
                        </Row>
                    </p>
                    <p >
                        <Row>
                            <Col span={ 1 }>
                                <span className="error-code">554</span>
                            </Col>
                            <Col span={ 23 }>
                                <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5427"})}} >
                                </span>
                            </Col>
                        </Row>
                    </p>
                    <p >
                        <Row>
                            <Col span={ 1 }>
                                <span className="error-code">none</span>
                            </Col>
                            <Col span={ 23 }>
                                <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5428"})}} >
                                </span>
                            </Col>
                        </Row>
                    </p>
                    <div className="lite-desc-error">
                        { formatMessage({id: "LANG5429" })}
                    </div>
                    <div className="lite-desc-error">
                        { formatMessage({id: "LANG5430" })}
                    </div>
                </div>
                <div className="content">
                    <Table
                        rowKey="id"
                        columns={ columns }
                        pagination={ this.state.pagination }
                        dataSource={ this.state.mailSendLog }
                        showHeader={ !!this.state.mailSendLog.length }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading }
                    >
                    </Table>
                </div>
                <Modal title={ formatMessage({id: "LANG3923"}) }
                    visible={ this.state.infoVisible }
                    onOk={ this._infoCancel }
                    onCancel={ this._infoCancel }
                    footer={[
                        <Button onClick={this._infoCancel}>{ formatMessage({id: "LANG726"}) }</Button>
                    ]}
                >
                    <Table
                        rowKey="index"
                        columns={ columns_info }
                        pagination={ false }
                        dataSource={ sub_send_mail_log }
                        showHeader={ !!sub_send_mail_log.length }
                        scroll={{ y: 240 }}
                    >
                    </Table>
                </Modal>
                <div>
                    <BackTop />
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(EmailSendLog))

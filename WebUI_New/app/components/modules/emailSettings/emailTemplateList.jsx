'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select, Table } from 'antd'
import Validator from "../../api/validator"

const FormItem = Form.Item

class EmailTemplateList extends Component {
    constructor(props) {
        super(props)

        this.state = {
            fileList: [],
            account_template: [],
            emailType: {
                'cdr': 'LANG7',
                'fax': 'LANG95',
                'account': 'LANG85',
                'alert': 'LANG2553',
                'voicemail': 'LANG20',
                'password': 'LANG2810',
                'conference': 'LANG3775',
                'sip_account': 'LANG2927',
                'iax_account': 'LANG2928',
                'fxs_account': 'LANG2929'
            }
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {
    }
    _getInitData = () => {
        let fileList = this.state.fileList
        let account_template = this.state.account_template

        const emailType = this.state.emailType
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                sidx: 'd',
                sord: 'desc',
                action: 'listFile',
                type: 'account_template'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    account_template = response.account_template || []

                    $.each(account_template, function(index, item) {
                        let name = item.n
                        let type = name.substr(0, name.length - 14)

                        if (emailType[type]) {
                            fileList.push(item)
                        }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            fileList: fileList,
            account_template: account_template
        })
    }
    _createType = (text, record, index) => {
        const emailType = this.state.emailType
        const { formatMessage } = this.props.intl

        let type = record.n.substr(0, record.n.length - 14)
        let locale = emailType[type]

        const cellvalue = <span>{ formatMessage({id: locale}) }</span>

        return <div>
                { cellvalue }
            </div>
        }
    _edit = (record) => {
        let filename = record.n
        let type = filename.substr(0, filename.length - 14)

        browserHistory.push('/system-settings/emailSettings/template/' + type)
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        const columns = [{
                key: 'type',
                dataIndex: 'type',
                title: formatMessage({id: "LANG84"}),
                width: 150,
                render: (text, record, index) => (
                    this._createType(text, record, index)
                )
            }, {
                key: 'n',
                dataIndex: 'n',
                title: formatMessage({id: "LANG135"}),
                width: 150
            }, {
                key: 'd',
                dataIndex: 'd',
                title: formatMessage({id: "LANG247"}),
                width: 150
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                width: 150,
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG738"}) }
                                onClick={ this._edit.bind(this, record) }>
                            </span>
                        </div>
                }
            }]

        const pagination = {
                total: this.state.fileList.length,
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

        return (
                <div className="app-content-main" id="app-content-main">
                    <div className="content">
                        <Table
                            rowKey=""
                            columns={ columns }
                            pagination={ false }
                            dataSource={ this.state.fileList }
                            showHeader={ !!this.state.fileList.length }
                        />
                    </div>
                </div>
            )
    }
}

EmailTemplateList.propTypes = {
}

export default Form.create()(injectIntl(EmailTemplateList))

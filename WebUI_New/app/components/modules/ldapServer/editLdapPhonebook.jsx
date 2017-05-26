'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Modal, Button, Table, message, Popconfirm } from 'antd'
import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import Validator from "../../api/validator"
import Title from '../../../views/title'
import UCMGUI from "../../api/ucmgui"
import EditLdapPhonebookItem from "./editLdapPhonebookItem"

const baseServerURl = api.apiHost

class EditLdapPhonebook extends Component {
    constructor(props) {
        super(props)
        this.state = {
            phonebookDn: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {
                field: "dn",
                order: "asc"
            },
            record: {},
            addVisible: false,
            editVisible: false
        }
        this._showAddModal = (record) => {
            this.setState({
                addVisible: true,
                record: this.props.location.state.record
            })
        }
        this._showEditModal = (record) => {
            this.setState({
                editVisible: true,
                record: record
            })
        }
        this._handleAddOk = (e) => {
            this.setState({
                addVisible: false
            })
        }
        this._handleAddCancel = (e) => {
            this.setState({
                addVisible: false
            })
        }
        this._handleEditOk = (e) => {
            this.setState({
                editVisible: false
            })
        }
        this._handleEditCancel = (e) => {
            this.setState({
                editVisible: false
            })
        }
        this._handleSubmit = () => {
            const { formatMessage } = this.props.intl
            const form = this.props.form

            this.props.form.validateFieldsAndScroll((err, values) => {
                let me = this
                let refs = this.refs,
                    action = {}
                action = values
                for (let key in values) {
                    if (values.hasOwnProperty(key)) {
                        let divKey = refs["div_" + key]
                        if (divKey &&
                           divKey.props &&
                            ((divKey.props.className &&
                            divKey.props.className.indexOf("hidden") === -1) ||
                            typeof divKey.props.className === "undefined")) {
                            if (!err || (err && typeof err[key] === "undefined")) {
                                action[key] = UCMGUI.transCheckboxVal(values[key])
                            } else {
                                return
                            }
                        } else if (typeof divKey === "undefined") {
                            if (!err || (err && typeof err[key] === "undefined")) {
                                action[key] = UCMGUI.transCheckboxVal(values[key])
                            } else {
                                return
                            }
                        }
                    }
                }
            })
        }
    }
    componentDidMount() {
        this._listContacts()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _handleTableChange = (pagination, filters, sorter) => {
        const pager = this.state.pagination

        pager.current = pagination.current

        this.setState({
            pagination: pager,
            sorter: sorter
        })

        this._listContacts({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter.field,
            sord: sorter.order === "ascend" ? "asc" : "desc",
            ...filters
        })
    }
    _listContacts = () => {
        const locationState = this.props.location.state
        let action = {
            action: 'listLDAPContacts',
            phonebook_dn: locationState.record.dn
        }
        if (locationState.record.id === 1) {
            action = {
                action: 'listPBXContacts',
                pbx_contacts: null
            }
        }
        $.ajax({
            url: baseServerURl,
            method: 'post',
            data: action,
            type: 'json',
            async: true,
            success: function(res) {
                let phonebookDn = res.response.phonebook_dn

                if (locationState.record.id === 1) {
                    phonebookDn = res.response.pbx_contacts
                }
                const pagination = this.state.pagination
                // Read total count from server
                pagination.total = res.response.total_item

                this.setState({
                    phonebookDn: phonebookDn,
                    pagination
                })
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _deleteContact = (record) => {
        const { formatMessage } = this.props.intl
        const locationState = this.props.location.state

        let phonebookdn = locationState.record.dn
        message.loading(formatMessage({id: "LANG825"}, {0: formatMessage({ id: "LANG11" })}), 0)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "deleteContact",
                "ldap_contacts": JSON.stringify({
                    "phonebook_dn": phonebookdn,
                    "accountnumber": record.accountnumber
                }),
                "ringgroup_mem_exten": JSON.stringify({
                    "phonebook_dn": phonebookdn,
                    "member_extension": record.accountnumber
                })
            },
            type: 'json',
            async: true,
            success: function(res) {
                let bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    this._listContacts()
                    // message.success(formatMessage({id: "LANG816"}))
                }
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _editContact = (record) => {
        const locationState = this.props.location.state
        if (locationState.record.id === 1) {
            return
        }
        this._showEditModal(record)
    }
    _addContact = (record) => {
        const locationState = this.props.location.state
        if (locationState.record.id === 1) {
            return
        }
        this._showAddModal()
    }
    _handleCancel = () => {
        browserHistory.push('/system-settings/ldapServer/ldapPhonebook/')
    }
    render() {
        const { formatMessage } = this.props.intl
        const state = this.state
        const locationState = this.props.location.state

        const columns = locationState.record.id === 1 ? [{
                title: formatMessage({id: "LANG2222"}),
                dataIndex: 'extension',
                sorter: true
            }, {
                title: formatMessage({id: "LANG1361"}),
                dataIndex: 'fullname',
                sorter: true
            }, {
                title: formatMessage({id: "LANG74"}),
                dataIndex: '',
                key: 'x',
                render: (text, record, index) => {
                    return <span>
                        <span className={ locationState.record.id === 1 ? "sprite sprite-edit-disabled" : "sprite sprite-edit" } title={ formatMessage({ id: "LANG738"})} onClick={this._editContact.bind(this, record)}></span>
                        <Popconfirm title={
                            <FormattedHTMLMessage
                                id='LANG5616'
                            />}
                            onConfirm={() => this._deleteContact(record)}>
                            <span className={ locationState.record.id === 1 ? "sprite sprite-del-disabled" : "sprite sprite-del" } title={ formatMessage({ id: "LANG739"})} ></span>
                        </Popconfirm>
                    </span>
                }
            }
        ]
        : [{
                title: formatMessage({id: "LANG2222"}),
                dataIndex: 'accountnumber',
                sorter: true
            }, {
                title: formatMessage({id: "LANG1361"}),
                dataIndex: 'calleridname',
                sorter: true
            }, {
                title: formatMessage({id: "LANG74"}),
                dataIndex: '',
                key: 'x',
                render: (text, record, index) => {
                    return <span>
                        <span className={ locationState.record.id === 1 ? "sprite sprite-edit-disabled" : "sprite sprite-edit" } title={ formatMessage({ id: "LANG738"})} onClick={this._editContact.bind(this, record)}></span>
                        <Popconfirm title={
                            <FormattedHTMLMessage
                                id='LANG5616'
                            />}
                            onConfirm={() => this._deleteContact(record)}>
                            <span className={ locationState.record.id === 1 ? "sprite sprite-del-disabled" : "sprite sprite-del" } title={ formatMessage({ id: "LANG739"})} ></span>
                        </Popconfirm>
                    </span>
                }
            }
        ]
        const pagination = {
            total: state.phonebookDn.length,
            showSizeChanger: true,
            onShowSizeChange(current, pageSize) {
                console.log('Current: ', current, '; PageSize: ', pageSize)
            },
            onChange(current) {
                console.log('Current: ', current)
            }
        }
        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    isDisplay='display-block'
                    isDisplaySubmit="hidden"
                    onCancel={ this._handleCancel }
                    headerTitle={ formatMessage({ id: "LANG953" }, { 0: locationState.record.dn ? locationState.record.dn.split(",")[0].split("=")[1] : "" }) }
                />
                <div className="content">
                    <div className="top-button">
                        <Button icon="plus" type="primary" size="default" onClick={ this._addContact } disabled={ locationState.record.id === 1 ? true : false }>
                            {formatMessage({id: "LANG4949"})}
                        </Button>
                    </div>
                    <Table
                        rowSelection={ undefined }
                        columns={ columns }
                        rowKey={ record => record.accountnumber }
                        dataSource={ state.phonebookDn }
                        pagination={ state.pagination }
                        onChange={ this._handleTableChange }
                    />
                    <Modal
                        className="app-content-ldapPhonebook-width700"
                        title={ formatMessage({ id: "LANG4949" })}
                        visible={ state.addVisible }
                        onOk={ this._handleAddOk }
                        onCancel={ this._handleAddCancel }
                    >
                        {
                            <EditLdapPhonebookItem
                                handleOk = { this._handleAddOk }
                                handleCancel = { this._handleAddCancel }
                                record = { state.record }
                                listContacts = { this._listContacts }

                            />
                        }
                    </Modal>
                    <Modal
                        className="app-content-ldapPhonebook-width700"
                        title={ formatMessage({ id: "LANG5581" })}
                        visible={ state.editVisible }
                        onOk={ this._handleEditOk }
                        onCancel={ this._handleEditCancel }
                    >
                        {
                            <EditLdapPhonebookItem
                                handleOk = { this._handleEditOk }
                                handleCancel = { this._handleEditCancel }
                                record = { state.record }
                                listContacts = { this._listContacts }
                            />
                        }
                    </Modal>
                </div>
            </div>
        )
    }
}

module.exports = injectIntl(EditLdapPhonebook)

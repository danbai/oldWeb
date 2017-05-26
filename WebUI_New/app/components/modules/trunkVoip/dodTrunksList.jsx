'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Form, Input, Button, Row, Col, Table, Checkbox, Modal, Popconfirm, message, Tooltip, Select } from 'antd'
import { FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Validator from "../../api/validator"
import _ from 'underscore'
const FormItem = Form.Item
import Title from '../../../views/title'
import DodTrunksListItem from "./dodTrunksListItem"

class DodTrunksList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dod: [],
            membersArr: [],
            dodNumberArr: [],
            dodExtList: [],
            dodTmpExtList: [],
            memberLDAPList: [],
            curentMembersArr: [],
            record: {},
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {
                field: "dn",
                order: "asc"
            },
            addVisible: false,
            editVisible: false
        }
        this._showAddModal = (record) => {
            const {formatMessage} = this.props.intl

            let obj = {
            },
            curentMembersArr = []

            let dodTmpExtList = _.extend(this.state.dodTmpExtList, this.state.dodExtList),
                membersArr = this.state.membersArr
            this.setState({
                addVisible: true,
                record: {}
            })

            obj = {
                record: {}
            }

            if (_.isArray(dodTmpExtList)) {
                _.each(membersArr, function(i) {
                    let index = -1

                    for (var j = 0; j <= dodTmpExtList.length - 1; j++) {
                        if (dodTmpExtList[j].key !== i) {
                            continue
                        } else {
                            index = j
                        }
                    }

                    if (index !== -1 && dodTmpExtList[index]) {
                        dodTmpExtList.splice(index, 1)
                    }
                })
                obj["dodTmpExtList"] = dodTmpExtList
            }
            this.setState(obj)
        }
        this._showEditModal = (record) => {
            const {formatMessage} = this.props.intl

            let obj = {
            },
            curentMembersArr = []

            let dodTmpExtList = _.extend(this.state.dodTmpExtList, this.state.dodExtList),
                membersArr = this.state.membersArr

            this.setState({
                editVisible: true,
                record: record
            })
            let members = (record.members ? record.members.split(",") : []),
                members_ldap = (record.members_ldap ? record.members_ldap.split("|") : [])

            $.each(members, function(index, item) {
                curentMembersArr.push(item)
            })

            $.each(members_ldap, function(index, item) {
                curentMembersArr.push(item)
            })

            obj = {
                record: record,
                dodTmpExtList: [],
                curentMembersArr: curentMembersArr
            }

            if (_.isArray(dodTmpExtList)) {
                _.each(membersArr, function(i) {
                    let index = -1

                    for (var j = 0; j <= dodTmpExtList.length - 1; j++) {
                        if (dodTmpExtList[j].key !== i) {
                            continue
                        } else {
                            index = j
                        }
                    }

                    if (curentMembersArr.indexOf(i) === -1 && index !== -1 && dodTmpExtList[index]) {
                        dodTmpExtList.splice(index, 1)
                    }
                })
                obj["dodTmpExtList"] = dodTmpExtList
            }
            this.setState(obj)
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
        this._setCurentMembersArr = (curentMembersArr) => {
            this.setState({
                curentMembersArr: curentMembersArr
            })
        }
    }
    componentDidMount() {
        this._listDODVoIPTrunk()
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
    _listDODVoIPTrunk = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listDODVoIPTrunk',
                trunk: this.props.params.trunkId,
                options: "number,add_extension,members,members_ldap"
            },
            type: 'json',
            async: true,
            success: function(res) {
                let dod = res.response.dod,
                    membersArr = []
                let dodNumberArr = []

                $.each(dod, function(index, item) {
                    var members = (item.members ? item.members.split(",") : []),
                        members_ldap = (item.members_ldap ? item.members_ldap.split("|") : [])

                    $.each(members, function(index, item) {
                        membersArr.push(item)
                    })

                    $.each(members_ldap, function(index, item) {
                        membersArr.push(item)
                    })

                    let num = item.number
                    dodNumberArr.push(num)
                })

                this.setState({
                    dod: dod,
                    membersArr: membersArr,
                    dodNumberArr: dodNumberArr
                })
                this._getList()
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }

    _getList = () => {
        let dodExtList = this._transAccountVoicemailData(UCMGUI.isExist.getList("getAccountList"))

        // Only VoIP Trunks
        if (this.props.location.state.signalling === 0) {
            $.ajax({
                async: false,
                type: "post",
                url: api.apiHost,
                data: {
                    "action": "getPhonebookListDnAndMembers"
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                    if (bool) {
                        let memberLDAP = data.response.extension,
                            memberLDAPList = [],
                            obj = {}

                        for (let i = 0; i < memberLDAP.length; i++) {
                            let phonebook = memberLDAP[i]["phonebook_dn"]

                            if (phonebook && (phonebook !== "ou=pbx,dc=pbx,dc=com")) {
                                let members = memberLDAP[i]["members"] ? memberLDAP[i]["members"].split('|') : []

                                for (let j = 0, length = members.length; j < length; j++) {
                                    let text = '',
                                        value = '',
                                        extension = members[j]

                                    if (extension) {
                                        text = extension + '(' + phonebook.split(',')[0] + ')'
                                        value = extension + '#' + phonebook

                                        dodExtList.push({
                                            'key': value,
                                            'description': 'LDAP',
                                            'title': text
                                        })
                                        memberLDAPList.push(value)
                                    }
                                }
                            }
                        }
                        this.setState({
                            memberLDAPList: memberLDAPList,
                            dodExtList: dodExtList,
                            curentMembersArr: []
                        })
                    }
                }.bind(this)
            })
        } else {
            this.setState({
                dodExtList: dodExtList
            })
        }
    }

    _transAccountVoicemailData = (res, cb) => {
        const {formatMessage} = this.props.intl

        let arr = [],
            dodExt = []

        for (var i = 0; i < res.length; i++) {
            var obj = {},
                extension = res[i].extension,
                fullname = res[i].fullname,
                disabled = res[i].out_of_service

            obj["key"] = extension

            if (disabled === 'yes') {
                obj["title"] = extension + (fullname ? (' "' + fullname + '"') : '') + ' <' + formatMessage({id: "LANG273"}) + '>'
                obj["disable"] = true // disabled extension
            } else {
                obj["title"] = extension + (fullname ? (' "' + fullname + '"') : '')
            }

            dodExt.push(extension)

            arr.push(obj)
        }

        if (cb && typeof cb === "function") {
            cb(arr)
        }

        return arr
    }
    _deleteDODVoIPTrunk = (record) => {
        const { formatMessage } = this.props.intl

        let action = {}

        action = {
            action: "deleteDODVoIPTrunk",
            trunk: this.props.params.trunkId,
            number: record.number
        }
        message.loading(formatMessage({ id: "LANG825" }, {0: "LANG11"}), 0)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: action,
            type: 'json',
            async: true,
            success: function(res) {
                var bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>)
                    this._listDODVoIPTrunk()
                }
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _editDod = (record) => {
        this._showEditModal(record)
    }
    _addDod = (record) => {
        this._showAddModal()
    }
    _handleCancel = () => {
        browserHistory.push('/extension-trunk/voipTrunk')
    }
    render() {
        const {formatMessage, formatHTMLMessage} = this.props.intl
        const state = this.state
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        const columns = [
            {
                title: formatMessage({id: "LANG2677"}),
                dataIndex: 'number'
            }, {
                title: formatMessage({id: "LANG87"}),
                dataIndex: 'members'
            }, {        // this.setState({
        //     curentMembersArr: [],
        //     visible: false
        // })
                title: formatMessage({id: "LANG74"}),
                dataIndex: '',
                key: 'x',
                render: (text, record, index) => (
                    <span>
                        <span className="sprite sprite-edit" onClick={this._editDod.bind(this, record)}></span>
                        <Popconfirm title={
                            <FormattedHTMLMessage
                                id='LANG818'
                                values={{
                                    0: record.number
                                }}
                            />}
                            onConfirm={() => this._deleteDODVoIPTrunk(record)}>
                            <span className="sprite sprite-del" ></span>
                        </Popconfirm>
                    </span>
                )
            }
        ]
        const pagination = {
            total: this.state.dod.length,
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
                    headerTitle={ formatMessage({id: "LANG2677"}) }
                />
                <div className="content">
                    <div className="top-button">
                        <Button icon="plus" type="primary" size="default" onClick={ this._addDod } >
                            { formatMessage({id: "LANG2676"}) }
                        </Button>
                        <Table
                            rowSelection={ undefined }
                            columns={ columns }
                            rowKey={ record => record.accountnumber }
                            dataSource={ this.state.dod }
                            pagination={ pagination }
                            onChange={ this._handleTableChange }
                        />
                        <Modal
                            className="app-content-ldapPhonebook-width700"
                            title={ formatMessage({ id: "LANG5433" })}
                            visible={this.state.addVisible}
                            onOk={this._handleAddOk}
                            onCancel={this._handleAddCancel}
                        >
                        {
                            <DodTrunksListItem
                                handleOk = { this._handleAddOk }
                                handleCancel = { this._handleAddCancel }
                                record = { state.record }
                                trunkId = { this.props.params.trunkId }
                                dodTmpExtList = { state.dodTmpExtList }
                                dodNumberArr = { state.dodNumberArr }
                                memberLDAPList = { state.memberLDAPList }
                                curentMembersArr = { state.curentMembersArr }
                                setCurentMembersArr = { this._setCurentMembersArr }
                                listDODVoIPTrunk = { this._listDODVoIPTrunk }
                            />
                        }
                        </Modal>
                        <Modal
                            className="app-content-ldapPhonebook-width700"
                            title={ formatMessage({ id: "LANG2675" })}
                            visible={this.state.editVisible}
                            onOk={this._handleEditOk}
                            onCancel={this._handleEditCancel}
                        >
                        {
                            <DodTrunksListItem
                                handleOk = { this._handleEditOk }
                                handleCancel = { this._handleEditCancel }
                                record = { state.record }
                                trunkId = { this.props.params.trunkId }
                                dodTmpExtList = { state.dodTmpExtList }
                                dodNumberArr = { state.dodNumberArr }
                                memberLDAPList = { state.memberLDAPList }
                                curentMembersArr = { state.curentMembersArr }
                                setCurentMembersArr = { this._setCurentMembersArr }
                                listDODVoIPTrunk = { this._listDODVoIPTrunk }
                            />
                        }
                    
                        </Modal>
                    </div>
                </div>
            </div>
        )
    }
}

DodTrunksList.defaultProps = {

}

export default Form.create()(injectIntl(DodTrunksList))

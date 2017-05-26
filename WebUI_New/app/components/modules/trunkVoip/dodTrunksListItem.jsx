'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Modal, Button, Row, Col, Checkbox, message, Tooltip, Select, Tabs, Spin, Transfer } from 'antd'
import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import Validator from "../../api/validator"
import Title from '../../../views/title'
import UCMGUI from "../../api/ucmgui"

const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost

class DodTrunksListItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
        this._handleSave = () => {
            const { formatMessage } = this.props.intl
            const form = this.props.form
            let trunkId = this.props.trunkId,
                action = {},
                members = [],
                membersLdap = [],
                me = this,
                curentMembersArr = this.props.curentMembersArr || []

            if (curentMembersArr.length === 0) {
                Modal.warning({
                    content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG3456"})}} ></span>,
                    okText: (formatMessage({id: "LANG727"}))
                })
            } else {
                this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
                    if (!err) {
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
                        this.props.handleOk()
                        message.loading(formatMessage({ id: "LANG826" }), 0)

                        if (!me.props.record.number) {
                            action["action"] = "addDODVoIPTrunk"
                        } else {
                            action["action"] = "updateDODVoIPTrunk"
                        }

                        action["trunk"] = trunkId

                        for (let i = 0; i <= curentMembersArr.length - 1; i++) {
                            let index = curentMembersArr[i]

                            if (this.props.memberLDAPList.indexOf(index) === -1) {
                                members.push(index)
                            } else {
                                membersLdap.push(index)
                            }
                        }

                        if (members) {
                            action["members"] = members.join(",")
                        }
                        if (membersLdap) {
                            action["members_ldap"] = membersLdap.join("|")
                        }

                        if (members === "" && membersLdap === "") {
                            return
                        }

                        $.ajax({
                            url: api.apiHost,
                            method: "post",
                            data: action,
                            type: 'json',
                            error: function(e) {
                                message.error(e.statusText)
                            },
                            success: function(data) {
                                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                if (bool) {
                                    message.destroy()
                                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                                    this.props.listDODVoIPTrunk()
                                    form.resetFields()
                                }
                            }.bind(this)
                        })
                        // this.props.setCurentMembersArr([])
                    }
                })
            }
        }
        this._handleCancel = () => {
            const form = this.props.form
            // this.props.setCurentMembersArr([])
            form.resetFields()
            this.props.handleCancel()
        }
        this._handleChange = (nextTargetKeys, direction, moveKeys) => {
            this.props.setCurentMembersArr(nextTargetKeys)
        }
        this._handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
            this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] })
        }
    }
    componentDidMount() {
    } 
    _dodNumberIsExist = (rule, val, callback, formatMessage) => {
        let dodNumberArr = this.props.dodNumberArr
        if (_.indexOf(dodNumberArr, val) > -1) {
            callback(formatMessage({id: "LANG270"}, {0: formatMessage({id: "LANG2680"})}))
        } else {
            callback()
        }
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const state = this.state
        const record = this.props.record
        const mytype = record.number ? "edit" : "add"
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 8 }
        }
        let curentMembersArr = this.props.curentMembersArr || []

        return (
                <Form>
                    <FormItem
                        ref="div_number"
                        { ...formItemLayout }
                        label={formatMessage({id: "LANG2680"})} >
                        { getFieldDecorator('number', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.calleridSip(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    mytype === "add" ? this._dodNumberIsExist(data, value, callback, formatMessage) : callback()
                                }
                            }],
                            initialValue: mytype === "edit" ? record.number : ""
                        })(
                            <Input maxLength="32" disabled={ mytype === "edit" ? true : false}/>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_add_extension"
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG5185" />}>
                                <span>{formatMessage({id: "LANG5184"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('add_extension', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: record.add_extension === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <Transfer
                        dataSource={this.props.dodTmpExtList}
                        titles={[formatMessage({id: "LANG2484"}), formatMessage({id: "LANG2483"})]}
                        targetKeys={curentMembersArr}
                        onChange={this._handleChange}
                        onSelectChange={this._handleSelectChange}
                        render={item => item.title}
                    />
                    <div className="app-ant-modal-footer">
                        <Button type="primary" onClick= { this._handleCancel }>
                            {formatMessage({id: "LANG726"})}
                        </Button>
                        <Button type="primary" onClick= { this._handleSave }>
                            {formatMessage({id: "LANG728"})}
                        </Button>
                    </div>
                </Form>
        )
    }
}

module.exports = Form.create()(injectIntl(DodTrunksListItem))
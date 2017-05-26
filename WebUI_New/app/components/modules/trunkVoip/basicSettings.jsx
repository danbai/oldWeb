'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost

class BasicSettings extends Component {
    constructor(props) {
        super(props)

        this.state = {
            firstLoad: true,
            needRegister: false
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getNameList()
        this.props.getRefs(this.refs)
    }
    componentDidUpdate() {
        const trunk = this.props.trunk || {}
        const form = this.props.form

        let trunkId = trunk.trunk_index,
            technology = this.props.technology,
            trunkType = this.props.trunkType

        if (!_.isEmpty(trunk) && this.state.firstLoad) {
            if (technology.toLowerCase() === "sip") {
                // this._setUsernameAndSerect(trunk)

                // var allow = (trunk.allow ? trunk.allow.split(",") : []),
                //     leftOpts = transData(codecsArr.remove(allow), codecsObj),
                //     rightOpts = transData(allow, codecsObj);

                // selectbox.appendOpts({
                //     el: "leftSelect",
                //     opts: leftOpts,
                //     selectedIndex: -1
                // }, doc);

                // selectbox.appendOpts({
                //     el: "rightSelect",
                //     opts: rightOpts,
                //     selectedIndex: -1
                // }, doc);

                this.setState({
                    needRegister: !(trunk.need_register === "yes" ? true : false)
                })
            }
            if (trunk.tel_uri) {
                this._onChangeTelUri(trunk.tel_uri)
            }
            this.setState({
                firstLoad: false
            })
        }
    }
    _onChangeNeedRegister = (e) => {
        this.setState({
            needRegister: !e.target.checked
        })
    }
    _onChangeTelUri = (val) => {
        this.props.getSonState({
            telUri: val
        })
    }
    _onChangeEnableCc = (e) => {
        this.setState({
            enableCc: e.target.checked
        })
    }
    _onChangeKeepcid = (e) => {
        const { validateFields, setFields } = this.props.form
        this.setState({
            keepcid: e.target.checked
        }, () => {
            validateFields(["cidnumber"], (errors, values) => {
                if (!e.target.checked) {
                    if (errors && errors.cidnumber) {
                        setFields({
                            cidnumber: {
                                value: values.cidnumber,
                                errors: [""]
                            }
                        })
                    }
                }
            })
        })
    }
    _transData = (res, cb) => {
        let arr = []

        for (var i = 0; i < res.length; i++) {
            arr.push(res[i]["trunk_name"])
        }

        if (cb && typeof cb === "function") {
            cb(arr)
        }

        return arr
    }
    _getNameList = () => {
        const { formatMessage } = this.props.intl
        let trunkList = UCMGUI.isExist.getList("getTrunkList", formatMessage)
        this.setState({
            trunkNameList: this._transData(trunkList)
        })
    }
    _trunkNameIsExist = (rule, value, callback, errMsg) => {
        let _this = this

        if (_.find(this.state.trunkNameList, function (num) {
            return (num === value && _this.props.trunk && _this.props.trunk.trunk_name !== value)
        })) {
            callback(errMsg)
        }
        callback()
    }
    _isRightIP = (rule, value, callback, errMsg) => {
        let ipArr = value.split("."),
            ipDNSReg = /(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])/

        if (ipDNSReg.test(value) && (ipArr[0] === "127" || ipArr[0] >= 224 || ipArr[3] === 0)) {
            callback(errMsg)
        } else {
            callback()
        }
    }
    _isSelfIP = (rule, value, callback, errMsg) => {
        let selfIp = window.location.hostname,
            inputIp = value.split(':')[0]

        if (inputIp === selfIp) {
            callback(errMsg)
        } else {
            callback()
        }
    }
    _setUsernameAndSerect = (data) => {
        const form = this.props.form

        form.setFieldsValue({
            username: (data && data.username) ? data.username : '',
            secret: (data && data.secret) ? data.secret : ''
        })
    }
    _checkCidnumberRequired = (rule, value, callback, formatMessage) => {
        let isChecked = this.props.form.getFieldValue("keepcid")

        if ((isChecked && value !== null && value !== "") || !isChecked) {
            callback()
        } else {
            callback(formatMessage({id: "LANG5066"}))
        }
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const trunk = this.props.trunk || {}
        let parentState = this.props.parentState

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        let trunkId = trunk.trunk_index,
            technology = this.props.technology,
            trunkType = this.props.trunkType

        return (
            <div className="content">
                <div className="ant-form">
                    <FormItem
                        ref="div_trunk_name"
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1383" />}>
                                <span>{formatMessage({id: "LANG1382"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('trunk_name', {
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
                                    Validator.alphanumeric(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    let errMsg = formatMessage({id: "LANG2137"})
                                    this._trunkNameIsExist(data, value, callback, errMsg)
                                }
                            }],
                            initialValue: trunk.trunk_name
                        })(
                            <Input maxLength="16" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_host"
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1374" />}>
                                <span>{formatMessage({id: "LANG1373"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('host', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    let errMsg = formatMessage({ id: "LANG1373"}).toLowerCase()
                                    // Validator.specialhost(data, value, callback, formatMessage, errMsg)
                                    Validator.host(data, value, callback, formatMessage, errMsg)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    let msg = formatMessage({id: "LANG2542"}, {0: formatMessage({id: "LANG1373"})})
                                    this._isSelfIP(data, value, callback, msg)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    let msg = formatMessage({id: "LANG2167"}, {0: formatMessage({id: "LANG1373"}).toLowerCase()})
                                    this._isRightIP(data, value, callback, msg)
                                }
                            }],
                            initialValue: trunk.host
                        })(
                            <Input maxLength="60" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_transport"
                        className={ parentState.div_transport_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1391" />}>
                                <span>{formatMessage({id: "LANG1392"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('transport', {
                            rules: [],
                            initialValue: trunk.transport
                        })(
                            <Select id="transport" name="transport" dfalt="udp,tcp,tls" mSelect="true">
                                 <Option value="udp">{formatMessage({id: "LANG1401"})}</Option>
                                 <Option value="tcp">{formatMessage({id: "LANG1402"})}</Option>
                                 <Option value="tls">{formatMessage({id: "LANG1403"})}</Option>
                             </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_keeporgcid"
                        className={ parentState.div_keeporgcid_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG4109" />}>
                                <span>{formatMessage({id: "LANG4108"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('keeporgcid', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.keeporgcid === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_keepcid"
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG2319" />}>
                                <span>{formatMessage({id: "LANG2318"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('keepcid', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.keepcid === "yes" ? true : false
                        })(
                            <Checkbox onChange={this._onChangeKeepcid} />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_nat"
                        className={ parentState.div_nat_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1093" /> }>
                                <span>{ formatMessage({id: "LANG5036"}) }</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('nat', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.nat === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3480" />}>
                                <span>{formatMessage({id: "LANG2757"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('out_of_service', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.out_of_service === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_tel_uri"
                        className={ parentState.div_tel_uri_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG2769" />}>
                                <span>{formatMessage({id: "LANG2768"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('tel_uri', {
                            rules: [],
                            initialValue: trunk.tel_uri
                        })(
                            <Select onChange={ this._onChangeTelUri } >
                                <Option value='disabled'>{formatMessage({id: "LANG2770"})}</Option>
                                <Option value='user_phone'>{formatMessage({id: "LANG2771"})}</Option>
                                <Option value='enabled'>{formatMessage({id: "LANG2772"})}</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_need_register"
                        className={ parentState.div_need_register_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3016" />}>
                                <span>{formatMessage({id: "LANG3015"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('need_register', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.need_register === "yes" ? true : false
                        })(
                            <Checkbox onChange={ this._onChangeNeedRegister }/>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_allow_outgoing_calls_if_reg_failed"
                        className={ parentState.div_allow_outgoing_calls_if_reg_failed_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG5070" />}>
                                <span>{formatMessage({id: "LANG5069"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('allow_outgoing_calls_if_reg_failed', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.allow_outgoing_calls_if_reg_failed === "yes" ? true : false
                        })(
                            <Checkbox disabled={ this.state.needRegister ? true : false } />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_cidnumber"
                        className={ parentState.div_cidnumber_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1360" />}>
                                <span>{formatMessage({id: "LANG1359"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('cidnumber', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.calleridSip(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this._checkCidnumberRequired(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: trunk.cidnumber
                        })(
                            <Input maxLength="64" />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1362" />}>
                                <span>{formatMessage({id: "LANG1361"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('cidname', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.cidName(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: trunk.cidname
                        })(
                            <Input maxLength="64" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_fromdomain"
                        className={ parentState.div_fromdomain_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1370" />}>
                                <span>{formatMessage({id: "LANG1369"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('fromdomain', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    let errMsg = formatMessage({ id: "LANG1369"})
                                    Validator.host(data, value, callback, formatMessage, errMsg)
                                }
                            }],
                            initialValue: trunk.fromdomain
                        })(
                            <Input maxLength="60" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_fromuser"
                        className={ parentState.div_fromuser_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1372" />}>
                                <span>{formatMessage({id: "LANG1371"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('fromuser', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.calleridSip(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: trunk.fromuser
                        })(
                            <Input maxLength="64" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_username"
                        className={ parentState.div_username_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1393" />}>
                                <span>{formatMessage({id: "LANG72"})}</span>
                            </Tooltip>
                        }>
                        <Input name="username" className="hidden"></Input>
                        { getFieldDecorator('username', {
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
                            }],
                            initialValue: trunk.username
                        })(
                            <Input maxLength="64" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_secret"
                        className={ parentState.div_secret_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={formatMessage({id: "LANG73"})}>
                        <Input type="password" name="secret" className="hidden"></Input>
                        { getFieldDecorator('secret', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.keyboradNoSpace(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: trunk.secret
                        })(
                            <Input type="password" maxLength="64" autoComplete="off" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_authid"
                        className={ parentState.div_authid_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG2488" />}>
                                <span>{formatMessage({id: "LANG2487"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('authid', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.specialauthid1(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: trunk.authid
                        })(
                            <Input maxLength="64" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_auth_trunk"
                        className={ parentState.div_auth_trunk_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG4262" />}>
                                <span>{formatMessage({id: "LANG4261"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('auth_trunk', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.auth_trunk === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_auto_recording"
                        className={ parentState.div_auto_recording_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG5266" />}>
                                <span>{formatMessage({id: "LANG2543"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('auto_recording', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.auto_recording === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                </div>
            </div>
        )
    }
}

export default injectIntl(BasicSettings)

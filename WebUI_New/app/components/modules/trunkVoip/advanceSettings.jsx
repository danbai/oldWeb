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

class AdvanceSettings extends Component {
    constructor(props) {
        super(props)

        this.state = {
            firstLoad: true,
            enableCc: false,
            faxIntelligentRoute: false,
            ldapDefaultOutrtOpts: [],
            codecsList: [],
            curentMembersArr: [],
            outboundRtNameObj: {}
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this.props.getRefs(this.refs)
        this._transCodecsArr()
    }
    componentDidUpdate() {
        const form = this.props.form
        const trunk = this.props.trunk || {}

        let trunkId = trunk.trunk_index,
            technology = this.props.technology,
            trunkType = this.props.trunkType

        if (this.state.firstLoad) {
            if (technology.toLowerCase() === "sip") {
                if (trunk.fax_intelligent_route_destination === "") {
                    form.setFieldsValue({
                        fax_intelligent_route_destination: "no"
                    })
                }

                if (trunk['cc_agent_policy'] && trunk['cc_agent_policy'] === 'native') {
                    form.setFieldsValue({
                        enable_cc: true,
                        cc_max_agents: trunk['cc_max_agents'] === 0 ? "" : trunk['cc_max_agents'],
                        cc_max_monitors: trunk['cc_max_monitors'] === 0 ? "" : trunk['cc_max_monitors']
                    })
                    this.setState({
                        enableCc: true
                    })
                }

                if ((trunk['faxdetect'] === 'no') && (trunk['fax_gateway'] === 'no')) {
                    form.setFieldsValue({
                        faxmode: 'no'
                    })
                    this._onChangeFaxmode('no')
                } else if (trunk['faxdetect'] === 'yes') {
                    form.setFieldsValue({
                        faxmode: 'detect'
                    })
                    this._onChangeFaxmode('detect')
                }

                if (form.getFieldValue("enable_qualify")) {
                    this.props.getSonState({
                        div_qualifyfreq_style: true
                    })
                } else {
                    this.props.getSonState({
                        div_qualifyfreq_style: false
                    })
                }
                if (trunkType.toLowerCase() === "peer") {
                    this._getOutbandRoutesList(trunk)
                    this._getldapdate(trunk.trunk_name)
                }
                this.setState({
                    faxIntelligentRoute: !form.getFieldValue("fax_intelligent_route")
                })
            }
            if (trunk.cc_agent_policy === "native") {
                this.setState({
                    enableCc: true
                })
            }
            if (trunk.outboundproxy) {
                this._onChangeChkOutboundproxy(trunk.outboundproxy)
            }
            if (trunk.send_ppi) {
                this._onChangeSendPpi(trunk.send_ppi)
                this._onChangeSendPai(trunk.send_ppi)
            }
            if (trunk.ldap_sync_enable) {
                this._onChangeLdapSyncEnable(trunk.ldap_sync_enable)
            }
            this.setState({
                firstLoad: false,
                curentMembersArr: trunk.allow ? trunk.allow.split(",") : []
            })
        }
    }
    _onChangeFaxmode = (val) => {
        this.setState({
            faxmode: val
        })
    }
    _onChangeEnableCc = (e) => {
        this.setState({
            enableCc: e.target.checked
        })
    }
    _onChangenableQualify = (e) => {
        this.props.getSonState({
            div_qualifyfreq_style: e.target.checked
        })
    }
    _onChangeLdapSyncEnable = (e) => {
        const form = this.props.form

        if (_.isString(e)) {
            if (e === "no") {
                form.setFieldsValue({
                    ldap_sync_passwd: ""// ,
                    // ldap_outrt_prefix: ""
                })
            }
            this.setState({
                ldapSyncEnable: e === "yes" ? true : false
            })
        } else {
            if (!e.target.checked) {
                form.setFieldsValue({
                    ldap_sync_passwd: ""// ,
                    // ldap_outrt_prefix: ""
                })
            }
            this.setState({
                ldapSyncEnable: e.target.checked
            })
        }
    }
    _onChangeChkOutboundproxy = (e) => {
        if (_.isString(e)) {
            this.setState({
                chkOutboundproxy: e ? true : false
            })
        } else {
            this.setState({
                chkOutboundproxy: e.target.checked
            })
        }
    }
    _onChangeSendPai = (e) => {
        const form = this.props.form

        if (_.isString(e)) {
            switch (e) {
                case "yes":
                    form.setFieldsValue({
                        send_ppi: true,
                        send_pai: false
                    })
                    this.setState({
                        sendPpi: true
                    })

                    this.props.getSonState({
                        div_send_ppi_style: true
                    })
                    break
                case "no":
                    form.setFieldsValue({
                        send_ppi: false,
                        send_pai: false
                    })
                    break
                case "pai":
                    form.setFieldsValue({
                        send_ppi: false,
                        send_pai: true
                    })
                    this.setState({
                        sendPai: true
                    })
                    this.props.getSonState({
                        div_send_pai_style: true
                    })
                    break
                default:
                    form.setFieldsValue({
                        send_ppi: false,
                        send_pai: false
                    })
                    break
            }
        } else {
            this.setState({
                sendPai: e.target.checked
            })
        }
    }
    _onChangeSendPpi = (e) => {
        if (_.isString(e)) {
            this.setState({
                sendPpi: e === "yes" ? true : false
            })
        } else {
            this.setState({
                sendPpi: e.target.checked
            })
        }
    }
    _onChangeFaxIntelligentRoute = (e) => {
        this.setState({
            faxIntelligentRoute: !e.target.checked
        })
    }
    _onChangeLdapDefaultOutrt = (val) => {
        const outboundRtNameObj = this.state.outboundRtNameObj
        let ldap_outrt_prefix = outboundRtNameObj[val]
        this.props.form.setFieldsValue({
            ldap_outrt_prefix: ldap_outrt_prefix
        })
        this.setState({
            ldapDefaultOutrt: val
        })
    }
    _handleChange = (nextTargetKeys, direction, moveKeys) => {
        this.setState({
            curentMembersArr: nextTargetKeys
        })
    }
    _handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] })
    }
    _getOutbandRoutesList(trunk) {
        const { formatMessage } = this.props.intl
        const form = this.props.form

        let trunkName = trunk.trunk_name,
            ldapDefaultOutrt = (trunk.ldap_default_outrt ? trunk.ldap_default_outrt : ""),
            ldapCustomPrefix = (trunk.ldap_custom_prefix ? trunk.ldap_custom_prefix : ""),
            outboundRtNameObj = {},
            outboundRtNameArr = []

        // $("#ldap_default_outrt").bind('change', outboundRtNameObj, function(ev) {
        //     var val = $(this).val(),
        //         ele = $("#ldap_outrt_prefix")

        //     if (val != "custom") {
        //         ele.attr("disabled", true)
        //     } else {
        //         ele.attr("disabled", false)
        //     }

        //     ele.val(outboundRtNameObj[val])

        //     ev.stopPropagation()
        // })

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: {
                action: "getOutbandRoutesList",
                trunk_name: trunkName
            },
            error: function() {
                outboundRtNameArr.push({
                    text: formatMessage({ id: "LANG133" }),
                    val: ""
                })

                outboundRtNameArr.push({
                    text: formatMessage({ id: "LANG2526" }),
                    val: "custom"
                })

                this.setState({
                    ldapDefaultOutrtOpts: outboundRtNameArr
                })
                form.setFieldsValue({
                    ldap_default_outrt: ldapDefaultOutrt
                })
                this._onChangeLdapDefaultOutrt(ldapDefaultOutrt)
            }.bind(this),
            success: function(data) {
                let response = data.response,
                    status = data.status,
                    outboundList = response.outbound_list

                if (status === 0) {
                    outboundRtNameArr.push({
                        text: formatMessage({ id: "LANG133" }),
                        val: ""
                    })

                    $.each(outboundList, function(index, val) {
                        var outboundRtIndex = val.outbound_rt_index,
                            outboundRtName = val.outbound_rt_name,
                            perfix = val.perfix,
                            obj = {}

                        obj["text"] = outboundRtName
                        obj["val"] = outboundRtIndex

                        outboundRtNameObj[outboundRtIndex] = perfix

                        outboundRtNameArr.push(obj)
                    })

                    outboundRtNameObj["custom"] = ldapCustomPrefix

                    outboundRtNameArr.push({
                        text: formatMessage({ id: "LANG2526" }),
                        val: "custom"
                    })

                    // selectbox.appendOpts({
                    //     el: "ldap_default_outrt",
                    //     opts: outboundRtNameArr,
                    //     selectedIndex: 3
                    // }, doc)
                    this.setState({
                        ldapDefaultOutrtOpts: outboundRtNameArr,
                        outboundRtNameObj: outboundRtNameObj
                    })
                } else {
                    outboundRtNameArr.push({
                        text: formatMessage({ id: "LANG133" }),
                        val: ""
                    })

                    outboundRtNameArr.push({
                        text: formatMessage({ id: "LANG2526" }),
                        val: "custom"
                    })
                    this.setState({
                        ldapDefaultOutrtOpts: outboundRtNameArr
                    })
                }

                if (ldapCustomPrefix) {
                    form.setFieldsValue({
                        ldap_default_outrt: "custom"
                    })
                    this._onChangeLdapDefaultOutrt("custom")
                } else {
                    form.setFieldsValue({
                        ldap_default_outrt: ldapDefaultOutrt
                    })
                    this._onChangeLdapDefaultOutrt(ldapDefaultOutrt)

                    var arr = []

                    // $.each($("#ldap_default_outrt").children(), function(index, val) {
                    //     arr.push($(val).val());
                    // });

                    // if ($.inArray(ldapDefaultOutrt.toString(), arr) == -1) {
                    //     $("#ldap_default_outrt")[0].selectedIndex = 0;
                    // }
                }
            }.bind(this)
        })
    }
    _getldapdate = (trunkName) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: {
                action: "getldapdate",
                ldap_last_sync_date: trunkName
            },
            success: function(data) {
                let response = data.response,
                    status = data.status,
                    date = response.ldap_last_sync_date,
                    labelLdapLastSyncDate = formatMessage({ id: "LANG2403" })

                if (status === 0) {
                    labelLdapLastSyncDate = date
                }
                this.setState({
                    labelLdapLastSyncDate: labelLdapLastSyncDate
                })
            }.bind(this)
        })
    }
    _checkLdapPrefix = (rule, value, callback) => {
        if (value && value === 'custom' && value === "") {
            callback("prefix is required.")
        }
        callback()
    }
    _checkOpenPort(rule, value, callback) {
        const { formatMessage } = this.props.intl

        let trunk = this.props.trunk,
            loadValue = trunk.ldap_sync_port ? trunk.ldap_sync_port.toString() : null

        if (Number(value) === Number(loadValue)) {
            callback()
        }

        for (let i = 0; i < this.props.openPort.length; i++) {
            let ele = this.props.openPort[i]

            if (Number(value) === Number(ele)) {
                callback(formatMessage({id: "LANG3869"}))
            }
        }

        callback()
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
            inputIp = value ? value.split(':')[0] : ""

        if (inputIp === selfIp) {
            callback(errMsg)
        } else {
            callback()
        }
    }
    _transCodecsArr = () => {
        let arr = [],
            parentState = this.props.parentState,
            technology = this.props.technology,
            codecsArr = parentState.codecsArr,
            codecsObj = parentState.codecsObj

        codecsArr.map(function(it) {
            if (technology.toLowerCase() === "iax" && it === "opus") {
                return
            }
            arr.push({
                key: it,
                title: codecsObj[it]
            })
        })
        this.setState({
            codecsList: arr
        })
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
                        ref="div_codecs"
                        className={ parentState.div_codecs_style === false ? "hidden" : "display-block" }
                        labelCol= {{ span: 6 }}
                        wrapperCol= {{ span: 8 }}
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1363" />}>
                                <span>{formatMessage({id: "LANG230"})}</span>
                            </Tooltip>
                        }>
                            <Transfer
                                sorter={ true }
                                dataSource={ this.state.codecsList }
                                titles={[formatMessage({id: "LANG631"}), formatMessage({id: "LANG630"})]}
                                targetKeys={this.state.curentMembersArr}
                                onChange={this._handleChange}
                                onSelectChange={this._handleSelectChange}
                                render={item => item.title}
                            />
                    </FormItem>
                    <FormItem
                        className="hidden"
                        { ...formItemLayout }
                        label="">
                            { getFieldDecorator('allow', {
                                rules: [],
                                initialValue: this.state.curentMembersArr.join(",")
                            })(
                                <Input />
                            ) }
                    </FormItem>
                    <FormItem
                        ref="div_send_ppi"
                        className={ parentState.div_send_ppi_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3901" />}>
                                <span>{formatMessage({id: "LANG3900"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('send_ppi', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.send_ppi === "yes" ? true : false
                        })(
                            <Checkbox onChange={ this._onChangeSendPpi } disabled={ this.state.sendPai ? true : false} />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_use_dod_in_ppi"
                        className={ this.state.sendPpi ? "display-block" : "hidden"}
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG5322" />}>
                                <span>{formatMessage({id: "LANG5321"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('use_dod_in_ppi', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.use_dod_in_ppi === "yes" ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_send_pai"
                        className={ parentState.div_send_pai_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3989" />}>
                                <span>{formatMessage({id: "LANG3988"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('send_pai', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.send_pai === "yes" ? true : false
                        })(
                            <Checkbox onChange={ this._onChangeSendPai } disabled={ this.state.sendPpi ? true : false } />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_pai_number"
                        className={ this.state.sendPai ? "display-block" : "hidden" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG5320" />}>
                                <span>{formatMessage({id: "LANG5319"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('pai_number', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.specailCalleridSip(data, value, callback, formatMessage, true)
                                }
                            }],
                            initialValue: trunk.pai_number
                        })(
                            <Input />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_chkOutboundproxy"
                        className={ parentState.div_chkOutboundproxy_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1381" />}>
                                <span>{formatMessage({id: "LANG1380"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('chkOutboundproxy', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: this.state.chkOutboundproxy
                        })(
                            <Checkbox onChange={ this._onChangeChkOutboundproxy } />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_outboundproxy"
                        className={ this.state.chkOutboundproxy ? "display-block" : "hidden" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1379" />}>
                                <span>{formatMessage({id: "LANG1378"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('outboundproxy', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.host(data, value, callback, formatMessage, formatMessage({id: "LANG1378"}))
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    let msg = formatMessage({id: "LANG2542"}, {0: formatMessage({id: "LANG1378"})})
                                    this._isSelfIP(data, value, callback, msg)
                                }
                            }],
                            initialValue: trunk.outboundproxy
                        })(
                            <Input />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_rmv_obp_from_route"
                        className={ this.state.chkOutboundproxy ? "display-block" : "hidden" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG5030" />}>
                                <span>{formatMessage({id: "LANG5029"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('rmv_obp_from_route', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.rmv_obp_from_route === "yes" ? true : false
                        })(
                            <Checkbox disabled={ parentState.telUri !== "disabled" ? true : false } />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_did_mode"
                        className={ parentState.div_did_mode_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={ <FormattedHTMLMessage id="LANG2649" /> }>
                                <span>{ formatMessage({id: "LANG2648"}) }</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('did_mode', {
                            rules: [],
                            initialValue: trunk.did_mode
                        })(
                            <Select>
                                <Option value='request-line'>{formatMessage({id: "LANG2650"})}</Option>
                                <Option value='to-header'>{formatMessage({id: "LANG2651"})}</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_dtmfmode"
                        className={ parentState.div_dtmfmode_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1786" />}>
                                <span>{formatMessage({id: "LANG1097"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('dtmfmode', {
                            rules: [],
                            initialValue: !trunk.dtmfmode ? "" : trunk.dtmfmode
                        })(
                            <Select>
                                <Option value=''>{formatMessage({id: "LANG257"})}</Option>
                                <Option value='rfc2833'>RFC2833</Option>
                                <Option value='info'>{formatMessage({id: "LANG1099"})}</Option>
                                <Option value='inband'>{formatMessage({id: "LANG1100"})}</Option>
                                <Option value='auto'>{formatMessage({id: "LANG138"})}</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_enable_qualify"
                        className={ parentState.div_enable_qualify_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1367" />}>
                                <span>{formatMessage({id: "LANG1366"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('enable_qualify', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: trunk.enable_qualify === "yes" ? true : false
                        })(
                            <Checkbox onChange={this._onChangenableQualify} />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_qualifyfreq"
                        className={ parentState.div_qualifyfreq_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1385" />}>
                                <span>{formatMessage({id: "LANG1384"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('qualifyfreq', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                /* type: 'integer', */
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.digits(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 1, 3600)
                                }
                            }],
                            initialValue: trunk.qualifyfreq ? trunk.qualifyfreq : 1
                        })(
                            <Input min={1} max={3600} maxLength="4" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_out_maxchans"
                        className={ parentState.div_out_maxchans_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG3024" />}>
                                <span>{formatMessage({id: "LANG3023"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('out_maxchans', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                /* type: 'integer', */
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.digits(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 0, 999)
                                }
                            }],
                            initialValue: trunk.out_maxchans ? trunk.out_maxchans : 0
                        })(
                            <Input max={999} />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_faxmode"
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG4199" />}>
                                <span>{formatMessage({id: "LANG3871"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('faxmode', {
                            rules: [],
                            initialValue: trunk.faxdetect === "yes" ? "detect" : "no"
                        })(
                            <Select onChange={this._onChangeFaxmode} >
                                <Option value='no'>{formatMessage({id: "LANG133"})}</Option>
                                <Option value='detect'>{formatMessage({id: "LANG1135"})}</Option>
                                {/* <option value='gateway' locale="LANG3554"></option> */}
                            </Select>
                        ) }
                    </FormItem>
                    <div ref="div_detect" className={ (technology.toLowerCase() === "sip" && this.state.faxmode === "detect") ? "display-block" : "hidden" } >
                        <FormItem
                            ref = "div_fax_intelligent_route"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG4380" />}>
                                    <span>{formatMessage({id: "LANG4379"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('fax_intelligent_route', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: trunk.fax_intelligent_route === "yes" ? true : false
                            })(
                                <Checkbox onChange={this._onChangeFaxIntelligentRoute } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_fax_intelligent_route_destination"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG4382" />}>
                                    <span>{formatMessage({id: "LANG4381"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('fax_intelligent_route_destination', {
                                rules: [],
                                initialValue: trunk.fax_intelligent_route_destination || ""
                            })(
                                <Select disabled={ this.state.faxIntelligentRoute } >
                                {
                                    parentState.faxIntelligentRouteDestinationOpts.map(function(it) {
                                        const text = it.text
                                        const val = it.val

                                        return <Option key={ val } value={ val }>
                                               { text ? text : val }
                                            </Option>
                                    })
                                }
                                </Select>
                            ) }
                        </FormItem>
                    </div>
                    <FormItem
                        ref="div_encryption"
                        className={ parentState.div_encryption_style === false ? "hidden" : "display-block" }
                        { ...formItemLayout }
                        label={
                            <Tooltip title={<FormattedHTMLMessage id="LANG1390" />}>
                                <span>{formatMessage({id: "LANG1389"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('encryption', {
                            rules: [],
                            initialValue: trunk.encryption
                        })(
                            <Select>
                                <Option value="no">{formatMessage({id: "LANG4377"})}</Option>
                                <Option value="support">{formatMessage({id: "LANG4376"})}</Option>
                                <Option value="yes">{formatMessage({id: "LANG4375"})}</Option>
                            </Select>
                        ) }
                    </FormItem>
                    {/* ldap for trunk */}
                    <div ref="div_ldap" className={ parentState.div_ldap_style === false ? "hidden" : "display-block" }>
                        <FormItem
                            ref="div_ldap_sync_enable"
                            className={ parentState.div_ldap_style === false ? "hidden" : "display-block" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2497" />}>
                                    <span>{formatMessage({id: "LANG2493"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('ldap_sync_enable', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: trunk.ldap_sync_enable === "yes" ? true : false
                            })(
                                <Checkbox onChange={this._onChangeLdapSyncEnable} />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_ldap_sync_passwd"
                            className={ this.state.ldapSyncEnable ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2498" />}>
                                    <span>{formatMessage({id: "LANG2494"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('ldap_sync_passwd', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.alphanumeric(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 4)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.checkAlphanumericPw(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: trunk.ldap_sync_passwd
                            })(
                                <Input maxLength="64" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_ldap_sync_port"
                            className={ this.state.ldapSyncEnable ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2499" />}>
                                    <span>{formatMessage({id: "LANG2495"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('ldap_sync_port', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    /* type: 'integer', */
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1, 65535)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this._checkOpenPort(data, value, callback)
                                    }
                                }],
                                initialValue: trunk.ldap_sync_port ? trunk.ldap_sync_port : 1
                            })(
                                <Input min={1} max={65534} />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_ldap_default_outrt"
                            className={ this.state.ldapSyncEnable ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2500" />}>
                                    <span>{formatMessage({id: "LANG2496"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('ldap_default_outrt', {
                                rules: [],
                                initialValue: trunk.ldap_default_outrt
                            })(
                                <Select onChange={ this._onChangeLdapDefaultOutrt }>
                                {
                                    this.state.ldapDefaultOutrtOpts.map(function(it) {
                                        const text = it.text
                                        const val = it.val

                                        return <Option key={ val } value={ val }>
                                               { text ? text : val }
                                            </Option>
                                    })
                                }
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_ldap_default_outrt_prefix"
                            className={ this.state.ldapSyncEnable ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2519" />}>
                                    <span>{formatMessage({id: "LANG2518"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('ldap_outrt_prefix', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    /* type: 'integer', */
                                    required: this.state.ldapDefaultOutrt === "custom",
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.ldapDefaultOutrt === "custom" ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.ldapDefaultOutrt === "custom" ? Validator.maxlength(data, value, callback, formatMessage, 14) : callback()
                                    }
                                }, {
                                    validator: this._checkLdapPrefix
                                }],
                                initialValue: trunk.ldap_default_outrt_prefix || trunk.ldap_custom_prefix
                            })(
                                <Input maxLength="14" disabled={ this.state.ldapDefaultOutrt !== "custom" ? true : false }/>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_ldap_last_sync_date"
                            className={ this.state.ldapSyncEnable ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2653" /> }>
                                    <span>{ formatMessage({id: "LANG2652"}) }</span>
                                </Tooltip>
                            }>
                            <div id="label_ldap_last_sync_date">{ this.state.labelLdapLastSyncDate }</div>
                        </FormItem>
                    </div>
                    {/*  ended of  ldap for trunk  */}
                    {/*  ccss for trunk  */}
                    <div ref="div_ccss" className={ parentState.div_ccss_style === false ? "hidden" : "display-block" } >
                        <div className='section-title'>{ formatMessage({id: "LANG3725"}) }</div>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3727" /> }>
                                    <span>{ formatMessage({id: "LANG3726"}) }</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('enable_cc', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: trunk.enable_cc
                            })(
                                <Checkbox onChange={ this._onChangeEnableCc } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_cc_max_agents"
                            className={ this.state.enableCc ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3734" /> }>
                                    <span>{ formatMessage({id: "LANG3733"}) }</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('cc_max_agents', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    /* type: 'integer', */
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1, 999)
                                    }
                                }, {
                                    validator: this._checkLdapPrefix
                                }],
                                initialValue: trunk.cc_max_agents ? trunk.cc_max_agents : 1
                            })(
                                <Input min={1} max={999} maxLength="10" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_cc_max_monitors"
                            className={ this.state.enableCc ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3740" /> }>
                                    <span>{ formatMessage({id: "LANG3739"}) }</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('cc_max_monitors', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    /* type: 'integer', */
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1, 999)
                                    }
                                }],
                                initialValue: trunk.cc_max_monitors ? trunk.cc_max_monitors : 1
                            })(
                                <Input min={1} max={999} maxLength="10" />
                            ) }
                        </FormItem>
                    </div>
                    {/* ended of  ccss for trunk */}
                </div>
            </div>
        )
    }
}

export default injectIntl(AdvanceSettings)

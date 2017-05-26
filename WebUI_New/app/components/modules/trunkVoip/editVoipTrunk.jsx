'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Transfer, Tabs, Modal } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import BasicSettings from "./basicSettings"
import AdvanceSettings from "./advanceSettings"
import _ from 'underscore'
import Title from '../../../views/title'
const TabPane = Tabs.TabPane
import Validator from "../../api/validator"

const baseServerURl = api.apiHost

// let extensionPrefSettings = UCMGUI.isExist.getRange() // [disable_extension_ranges, rand_password, weak_password]

class EditVoipTrunk extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: "1",
            codecsArr: ["ilbc", "g722", "g726aal2", "adpcm", "g723", "h263", "h263p", "h264", "vp8", "ulaw", "alaw", "gsm", "g726", "g729", "opus"],
            codecsObj: {
                ilbc: "iLBC",
                g722: "G.722",
                g726aal2: "AAL2-G.726-32",
                adpcm: "ADPCM",
                g723: "G.723",
                h263: "H.263",
                h263p: "H.263p",
                h264: "H.264",
                vp8: "VP8",
                ulaw: "PCMU",
                alaw: "PCMA",
                gsm: "GSM",
                g726: "G.726",
                g729: "G.729",
                opus: "OPUS"
            },
            openPort: [],
            telUri: "disabled",
            enableCc: false,
            refs: {},
            faxIntelligentRouteDestinationOpts: [],
            editAdvanced: false
        }
    }
    componentDidMount() {
        this._initForm()
        this._prepareEditItemForm()
        // this._isEnableWeakPw()
    }
    componentWillUnmount() {
    }
    _getRefs = (refs) => {
        this.setState({
            refs: _.extend(this.state.refs, refs)
        })
    }
    _getSonState = (state) => {
        this.setState(state)
    }
    _initForm() {
        const form = this.props.form

        let chkOutboundproxy = form.getFieldValue("chkOutboundproxy"),
            hideEles = ["div_need_register", "div_allow_outgoing_calls_if_reg_failed", "div_fromdomain", "div_fromuser",
                        "div_send_ppi", "div_send_pai", "div_ldap", "div_codecs", "div_transport",
                        "div_cidnumber", "div_enable_qualify", "div_faxmode", "div_qualifyfreq", "div_out_maxchans"],
            hideElesObj = {}

        // if (!chkOutboundproxy) {
        //     hideEles.concat(["div_outboundproxy", "div_rmv_obp_from_route"])
        // }
        hideEles.map(function(it) {
            hideElesObj[it + "_style"] = false
        })

        this.setState(hideElesObj)
    }
    _prepareEditItemForm() {
        const form = this.props.form

        let trunkId = this.props.params.trunkId,
            technology = this.props.params.technology,
            trunkType = this.props.params.trunkType,
            action = {
                trunk: trunkId
            }

        let hideEles = ["div_trunktype", "more_details", "div_did_mode"],
            showEles = ["div_enable_qualify", "div_faxmode", "div_out_maxchans", "div_codecs"],
            hideElesObj = {},
            showElesObj = {}

        if (technology.toLowerCase() === "sip") {
            showEles = showEles.concat(["div_transport", "div_did_mode"])

            if (trunkType.toLowerCase() === "peer") {
                let ldapSyncEnable = form.getFieldValue("ldap_sync_enable")
                    // els = ["div_ldap_sync_passwd", "div_ldap_sync_port", "div_ldap_default_outrt", "div_ldap_default_outrt_prefix",
                    //         "div_ldap_last_sync_date"]

                showEles = showEles.concat(["div_cidnumber", "div_ldap"])
                hideEles = hideEles.concat(["div_username", "div_secret", "div_authid", "div_auth_trunk", "div_chkOutboundproxy"])

                // if (!ldapSyncEnable) {
                //     hideEles = hideEles.concat(els)
                // }
            } else {
                showEles = showEles.concat(["div_need_register", "div_allow_outgoing_calls_if_reg_failed", "div_fromuser"])
            }
            showEles = showEles.concat(["div_fromdomain", "div_send_ppi", "div_send_pai"])

            action["action"] = "getSIPTrunk"
            this._getSIPTrunk(action)

            this._tectFax()

            this._getOpenPort()
        } else {
            hideEles = hideEles.concat(["div_transport", "div_authid", "div_chkOutboundproxy", "div_rmv_obp_from_route",
                "div_auto_recording", "div_auth_trunk", "div_encryption", "div_tel_uri", "div_dtmfmode", "div_ccss", "div_keeporgcid", "div_nat"])
            showEles.push("div_cidnumber")

            if (trunkType.toLowerCase() === "peer") {
                hideEles = hideEles.concat(["div_username", "div_secret"])
            } else {
                showEles = showEles.concat(["div_username", "div_secret"])
            }

            action["action"] = "getIAXTrunk"
            this._getIAXTrunk(action)
        }
        showEles.map(function(it) {
            showElesObj[it + "_style"] = true
        })
        hideEles.map(function(it) {
            hideElesObj[it + "_style"] = false
        })

        showElesObj = _.extend(hideElesObj, showElesObj)
        this.setState(showElesObj)
    }
    _isEnableWeakPw = () => {
        // if (extensionPrefSettings[2] == 'yes') { // weak_password
        //     var obj = {
        //         pwsId: "#ldap_sync_passwd",
        //         doc: document
        //     }

        //     $P("#ldap_sync_passwd", document).rules("add", {
        //         checkAlphanumericPw: [UCMGUI.enableWeakPw.showCheckPassword, obj]
        //     })
        // }
    }
    _tectFax = () => {
        const { formatMessage } = this.props.intl

        let accountList = UCMGUI.isExist.getList("listAccount").account,
            faxList = UCMGUI.isExist.getList("listFax").fax,
            arr = [{
                val: "",
                text: formatMessage({id: "LANG133"})
            }],
            ele = ''

        for (let i = 0; i < accountList.length; i++) {
            ele = accountList[i]

            if (ele.account_type.match(/FXS/i)) {
                arr.push({
                    val: ele.extension
                })
            }
        }

        for (let i = 0; i < faxList.length; i++) {
            ele = faxList[i]
            arr.push({
                val: ele.extension
            })
        }

        this.setState({
            faxIntelligentRouteDestinationOpts: arr
        })
        // enableCheckBox({
        //     enableCheckBox: 'fax_intelligent_route',
        //     enableList: ['fax_intelligent_route_destination']
        // }, doc)

        // enableCheckBox({
        //     enableCheckBox: 'need_register',
        //     enableList: ['allow_outgoing_calls_if_reg_failed']
        // }, doc)
    }
    _getSIPTrunk = (action) => {
        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        trunk = res.trunk
                    this.setState({
                        trunk: trunk
                    })
                }
            }.bind(this)
        })
    }
    _getIAXTrunk = (action) => {
        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        trunk = res.trunk
                    this.setState({
                        trunk: trunk
                    })
                }
            }.bind(this)
        })
    }
    _getOpenPort = () => {
        let openPort = []

        $.ajax({
            url: baseServerURl,
            method: "post",
            data: {
                action: "getNetstatInfo"
            },
            async: true,
            dataType: "json",
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let netstat = data.response.netstat,
                        currentPort = ''

                    for (let i = 0, length = netstat.length; i < length; i++) {
                        currentPort = netstat[i]['port']

                        if (openPort.length !== 0 && _.find(openPort, function (num) {
                                return num !== currentPort
                            })) {
                            openPort.push(currentPort)
                        } else {
                            openPort.push(currentPort)
                        }
                    }
                    this.setState({
                        openPort: this.state.openPort.concat(openPort)
                    })
                }
            }.bind(this)
        })

        $.ajax({
            url: baseServerURl,
            method: "post",
            data: {
                action: "getSIPTCPSettings"
            },
            // async: false,
            dataType: "json",
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data)

                if (bool) {
                    let tlsbindaddr = data.response.sip_tcp_settings.tlsbindaddr,
                        tcpbindaddr = data.response.sip_tcp_settings.tcpbindaddr

                    if (tlsbindaddr) {
                        let tlsPort = tlsbindaddr.split(":")[1]

                        if (openPort.length !== 0 && tlsPort && _.find(openPort, function (num) {
                                return num !== tlsPort
                            })) {
                            openPort.push(tlsPort)
                        } else {
                            openPort.push(tlsPort)
                        }
                    }

                    if (tcpbindaddr) {
                        let tcpPort = tcpbindaddr.split(":")[1]

                        if (openPort.length !== 0 && tcpPort && _.find(openPort, function (num) {
                                return num !== tcpPort
                            })) {
                            openPort.push(tcpPort)
                        } else {
                            openPort.push(tcpPort)
                        }
                    }
                    this.setState({
                        openPort: this.state.openPort.concat(openPort)
                    })
                }
            }.bind(this)
        })
    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl
        let trunkId = this.props.params.trunkId,
            technology = this.props.params.technology,
            trunkType = this.props.params.trunkType,
            action = {}

        if (technology.toLowerCase() === "sip") {
            action["action"] = "updateSIPTrunk"
        } else {
            action["action"] = "updateIAXTrunk"
        }

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            let me = this
            let refs = me.state.refs

            if (this.state.editAdvanced && !values.allow) {
                message.warn(formatMessage({id: "LANG3531"}, {0: '1', 1: formatMessage({id: "LANG230"})}))
                return
            }

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
                    } else if (key === 'ldap_outrt_prefix') {
                        divKey = 'div_ldap_default_outrt_prefix'
                        if (!err || (err && typeof err[key] === "undefined")) {
                            action[key] = UCMGUI.transCheckboxVal(values[key])
                        } else {
                            return
                        }
                    } else if (typeof divKey === "undefined") {
                        action[key] = UCMGUI.transCheckboxVal(values[key])
                    }
                }
            }
            action = me._transAction(action)
            let confirmStr = ""

            if ((action["action"].toLowerCase().indexOf('sip') > -1) && /[a-zA-Z]/g.test(action['host']) && !UCMGUI.isIPv6(action['host'])) {
                confirmStr = formatMessage({ id: "LANG4163" })
            } else if ((action["action"].toLowerCase().indexOf('iax') > -1) &&
                (/[a-zA-Z]/g.test(action['host']) || /:\d*$/.test(action['host'])) && !UCMGUI.isIPv6(action['host'])) {
                confirmStr = formatMessage({ id: "LANG4469" })
            }
            if (confirmStr) {
                Modal.confirm({
                    content: confirmStr,
                    okText: formatMessage({id: "LANG727"}),
                    cancelText: formatMessage({id: "LANG726"}),
                    onOk: this._doUpdateTrunksInfo.bind(this, action)
                })
            } else {
                this._doUpdateTrunksInfo(action)
            }
            // this._doUpdateTrunksInfo(action)
        })
    }
    _doUpdateTrunksInfo = (action) => {
        const { formatMessage } = this.props.intl
        message.loading(formatMessage({ id: "LANG826" }), 0)

        if (action["host"]) {
            if (UCMGUI.isIPv6NoPort(action["host"])) {
                action["host"] = "[" + action["host"] + "]"
            }
        }
        if (action["fromdomain"]) {
            if (UCMGUI.isIPv6NoPort(action["fromdomain"])) {
                action["fromdomain"] = "[" + action["fromdomain"] + "]"
            }
        }
        if (action["outboundproxy"]) {
            if (UCMGUI.isIPv6NoPort(action["outboundproxy"])) {
                action["outboundproxy"] = "[" + action["outboundproxy"] + "]"
            }
        }

        $.ajax({
            url: baseServerURl,
            method: "post",
            data: action,
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                    browserHistory.push('/extension-trunk/voipTrunk')
                }
            }.bind(this)
        })
    }
    _transAction = (action) => {
        const form = this.props.form

        let trunkId = this.props.params.trunkId,
            technology = this.props.params.technology,
            trunkType = this.props.params.trunkType

        let fax = form.getFieldValue("faxmode")

        if (fax === "no") {
            action['faxdetect'] = "no"
            action['fax_gateway'] = "no"
        } else if (fax === "detect") {
            action['faxdetect'] = "yes"
            action['fax_gateway'] = "no"
        }
        delete action['faxmode']

        if (technology.toLowerCase() === "sip") {
            if (form.getFieldValue('enable_cc')) {
                action['cc_agent_policy'] = "native"
                action['cc_monitor_policy'] = "native"
                action['cc_max_agents'] = form.getFieldValue('cc_max_agents')
                action['cc_max_monitors'] = form.getFieldValue('cc_max_monitors')
                action['cc_offer_timer'] = "120"
                action['ccnr_available_timer'] = "3600"
                action['ccbs_available_timer'] = "3600"
            } else {
                action['cc_agent_policy'] = "never"
                action['cc_monitor_policy'] = "never"
            }
            if (typeof form.getFieldValue("send_ppi") !== "undefined") {
                if (form.getFieldValue("send_ppi")) {
                    action['send_ppi'] = "yes"
                    action['pai_number'] = ""
                } else if (form.getFieldValue("send_pai")) {
                    action['send_ppi'] = "pai"
                    action['use_dod_in_ppi'] = "no"
                } else {
                    action['send_ppi'] = "no"
                    action['pai_number'] = ""
                    action['use_dod_in_ppi'] = "no"
                }    
            }
        }
        delete action['enable_cc']
        delete action['send_pai']
        // delete action['send_ppi']

        if (technology.toLowerCase() === "sip") {
            if (fax === "detect") {
                let bEnableRoute = form.getFieldValue('fax_intelligent_route')
                action['fax_intelligent_route'] = bEnableRoute ? 'yes' : 'no'

                if (bEnableRoute) {
                    action['fax_intelligent_route_destination'] = form.getFieldValue('fax_intelligent_route_destination')
                }
            }
            if (trunkType.toLowerCase() === "peer" && form.getFieldValue("ldap_sync_enable")) {
                let outrtVal = form.getFieldValue("ldap_default_outrt"),
                    prefixVal = form.getFieldValue("ldap_outrt_prefix")

                if (!outrtVal) {
                    action["ldap_default_outrt"] = ""
                    action["ldap_default_outrt_prefix"] = ""
                    action["ldap_custom_prefix"] = ""
                } else if (outrtVal !== "custom") {
                    action["ldap_default_outrt"] = outrtVal
                    action["ldap_default_outrt_prefix"] = prefixVal
                    action["ldap_custom_prefix"] = ""
                } else {
                    action["ldap_default_outrt"] = ""
                    action["ldap_default_outrt_prefix"] = ""
                    action["ldap_custom_prefix"] = prefixVal
                }
            } else if (trunkType.toLowerCase() === "register") {
                if (!form.getFieldValue("chkOutboundproxy")) {
                    action["outboundproxy"] = ""
                    action["rmv_obp_from_route"] = "no"
                }
                if (form.getFieldValue("tel_uri") !== "disabled") {
                    action["rmv_obp_from_route"] = "no"
                }
            }
        } else {
            delete action['fax_intelligent_route']
            delete action['fax_intelligent_route_destination']
        }
        // delete action['ldap_default_outrt']
        delete action['ldap_outrt_prefix']
        delete action['chkOutboundproxy']
        // let rightArr = []

        // $.each($("#rightSelect").children(), function(index, item) {
        //     rightArr.push($(item).val())
        // })

        // action["allow"] = rightArr.toString()
        action["trunk"] = trunkId
        delete action["trunk_index"]

        // if (action["user_name"]) {
        //     action["username"] = action["user_name"]
        //     delete action["user_name"]
        // }

        // if (action["password"]) {
        //     action["secret"] = action["password"]
        //     delete action["password"]
        // }
        return action
    }
    _handleCancel = (e) => {
        browserHistory.push('/extension-trunk/voipTrunk')
    }
    _onChange = (activeKey) => {
        // this.props.form.validateFieldsAndScroll((err, values) => {
        //     if (err) {
        //         this.setState({
        //             activeKey: this.state.activeKey
        //         })
        //         return
        //     }

            this.setState({
                activeKey
            })

            if (activeKey === '2') {
                this.setState({
                    editAdvanced: true
                })
            }
        // })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        let trunkId = this.props.params.trunkId,
            technology = this.props.params.technology,
            trunkType = this.props.params.trunkType,
            trunkName = this.props.params.trunkName

        let headerTitle = formatMessage({
            id: "LANG222"
        }, {
            0: technology === "SIP" ? formatMessage({id: "LANG5017"}) : formatMessage({id: "LANG5018"}),
            1: trunkName
        })
        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    headerTitle={ headerTitle }
                    onSubmit={ this._handleSubmit.bind(this) }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                />
                <Form className="form-contain-tab">
                    <Tabs
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChange }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={formatMessage({id: "LANG2217"})} key="1">
                            <BasicSettings form={ this.props.form }
                                getRefs={ this._getRefs.bind(this) }
                                trunk={ this.state.trunk }
                                trunkType = { trunkType }
                                technology = { technology }
                                getSonState = { this._getSonState }
                                parentState= { this.state }
                            />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG542"})} key="2">
                            <AdvanceSettings form={ this.props.form }
                                getRefs={ this._getRefs.bind(this) }
                                trunk={ this.state.trunk }
                                trunkType = { trunkType }
                                technology = { technology }
                                openPort = { this.state.openPort }
                                getSonState = { this._getSonState }
                                parentState= { this.state }
                            />
                        </TabPane>
                    </Tabs>
                </Form>
            </div>
        )
    }
}

EditVoipTrunk.propTypes = {
}

export default Form.create()(injectIntl(EditVoipTrunk))

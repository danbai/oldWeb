'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import BasicSettings from './basicSettings'
import DHCPClient from './dhcpclient'
import Network8021x from './8021x'
import StaticRoute from './staticRoute'
import PortForwarding from './portForwarding'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { browserHistory } from 'react-router'
import Title from '../../../views/title'
import { Form, Input, Tabs, message, Modal, BackTop } from 'antd'
const TabPane = Tabs.TabPane
import _ from 'underscore'

const baseServerURl = api.apiHost
const interfaceObj = {
    '0': 'eth1',
    '1': 'eth0',
    '2': {
        'LAN1': 'eth0',
        'LAN2': 'eth1'
    }
}

class NetWorkSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: this.props.params.id ? this.props.params.id : 'basicSettings',
            isDisplay: (this.props.params.id === 'DHCPClient' || this.props.params.id === 'staticRoute' || this.props.params.id === 'portForwarding') ? "hidden" : "display-block",
            network_settings: {},
            dhcp_settings: {},
            dhcp6_settings: {},
            method_8021_calss: {
                lan1: 'hidden',
                lan2: 'display-block',
                lantitle: 'display-block',
                lan1title: 'hidden',
                lan2title: 'hidden',
                wantitle: 'hidden'
            },
            firstLoad: false
        }
    }
    componentWillMount() {
        this._getInitNetwork()
    }
    componentDidMount() {
    }
    componentWillUnmount() {

    }
    _onChange = (activeKey) => {
        if (activeKey === "DHCPClient" || activeKey === "staticRoute" || activeKey === "portForwarding") {
            this.setState({
                activeKey,
                isDisplay: "hidden"
            })
        } else {
            this.setState({
                activeKey,
                isDisplay: "display-block"
            })
        }
    }
    _save8021x = (err, values) => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        const __this = this

        // if (checkIfRejectRules(method)) {
            let buf = {}
            buf["action"] = "updateNetworkproSettings"
            buf["mode"] = form.getFieldValue('mode')
            if (buf["mode"] !== undefined) {
                buf["identity"] = form.getFieldValue('identity')
                buf["md5_secret"] = form.getFieldValue('md5_secret')
                buf["lan2.802.1x.mode"] = form.getFieldValue('lan2.802.1x.mode')
                buf["lan2.802.1x.identity"] = form.getFieldValue('lan2.802.1x.identity')
                buf["lan2.802.1x.username"] = form.getFieldValue('lan2.802.1x.username')
                buf["lan2.802.1x.password"] = form.getFieldValue('lan2.802.1x.password')
                let flags = false

                _.map(buf, function(num, key) {
                    if (err && err.hasOwnProperty(key)) {
                        flags = true
                    }
                })
                if (flags) {
                    return
                }
                $.ajax({
                    type: "post",
                    url: baseServerURl,
                    data: buf,
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, formatMessage)

                        if (bool) {
                            /* -------- End -------- */
                            __this._saveRes()
                        }
                    }
                })
            } else {
                __this._saveRes()
            }
        // }
    }
    _saveChangeCallback = (err, values) => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        const __this = this

        let flag = false
        let buf = {}
        let defaultInterface = form.getFieldValue("default_interface")
        let method = form.getFieldValue("method")
        let lasInterface = ''
        if (method === '2') {
            lasInterface = interfaceObj[method][defaultInterface]
        } else {
            lasInterface = interfaceObj[method]
        }

        buf["action"] = "updateNetworkSettings"
        buf["altdns"] = form.getFieldValue("altdns") || '0.0.0.0'
        buf["mtu"] = form.getFieldValue("mtu")

        const model_info = JSON.parse(localStorage.getItem('model_info'))

        if (Number(model_info.num_eth) >= 2) {
            buf["method"] = method

            if (model_info.allow_nat === "1") {
                flag = true
            }

            if (method === "0") {
                buf["dhcp_ipaddr"] = form.getFieldValue("dhcp_ipaddr")
                buf["dhcp_submask"] = form.getFieldValue("dhcp_submask")
                buf["lan2_vid"] = form.getFieldValue("lan2_vid")
                buf["lan2_priority"] = form.getFieldValue("lan2_priority")
            } else if (method === "2") {
                let sval = form.getFieldValue("lan2_ip_method")
                let s6val = form.getFieldValue("lan2_ip6_method")

                buf["default_interface"] = defaultInterface
                buf["lan2_ip_method"] = sval
                buf["lan2_ip6_method"] = s6val

                if (sval === "1") {
                    buf["lan2_ip"] = form.getFieldValue("lan2_ip")
                    buf["lan2_mask"] = form.getFieldValue("lan2_mask")
                    buf["lan2_gateway"] = form.getFieldValue("lan2_gateway")
                    buf["lan2_dns1"] = form.getFieldValue("lan2_dns1")
                    buf["lan2_dns2"] = form.getFieldValue("lan2_dns2")
                } else if (sval === "2") {
                    buf["lan2_username"] = form.getFieldValue("lan2_username")
                    buf["lan2_password"] = form.getFieldValue("lan2_password")
                }

                buf["lan2_vid"] = form.getFieldValue("lan2_vid")
                buf["lan2_priority"] = form.getFieldValue("lan2_priority")

                if (s6val === "1") {
                    buf["lan2_ipaddr6"] = form.getFieldValue("lan2_ipaddr6")
                    buf["lan2_ip6_dns1"] = form.getFieldValue("lan2_ip6_dns1")
                    buf["lan2_ip6_dns2"] = form.getFieldValue("lan2_ip6_dns2")
                    buf["lan2_ip6_prefixlen"] = form.getFieldValue("lan2_ip6_prefixlen")
                }
            }
        }
        let sval = form.getFieldValue("lan1_ip_method")
        let s6val = form.getFieldValue("lan1_ip6_method")
        if (sval === "0") {
            buf["lan1_ip_method"] = "0"
        } else if (sval === "1") {
            buf["lan1_ip_method"] = "1"
            buf["lan1_ipaddr"] = form.getFieldValue("lan1_ipaddr")
            buf["lan1_submask"] = form.getFieldValue("lan1_submask")
            buf["lan1_gateway"] = form.getFieldValue("lan1_gateway")
            buf["lan1_dns1"] = form.getFieldValue("lan1_dns1")
            buf["lan1_dns2"] = form.getFieldValue("lan1_dns2") || '0.0.0.0'
        } else {
            buf["lan1_ip_method"] = "2"
            // buf["lan1_username"] = encodeURIComponent($("#lan1_username").val());
            // buf["lan1_password"] = encodeURIComponent($("#lan1_password").val());
            buf["lan1_username"] = form.getFieldValue("lan1_username")
            buf["lan1_password"] = form.getFieldValue("lan1_password")
        }

        buf["lan1_vid"] = form.getFieldValue("lan1_vid")
        buf["lan1_priority"] = form.getFieldValue("lan1_priority")

        if (s6val === "0") {
            buf["lan1_ip6_method"] = "0"
        } else if (s6val === "1") {
            buf["lan1_ip6_method"] = "1"
            buf["lan1_ipaddr6"] = form.getFieldValue("lan1_ipaddr6")
            buf["lan1_ip6_dns1"] = form.getFieldValue("lan1_ip6_dns1")
            buf["lan1_ip6_dns2"] = form.getFieldValue("lan1_ip6_dns2")
            buf["lan1_ip6_prefixlen"] = form.getFieldValue("lan1_ip6_prefixlen") || '64'
        }

        if (flag) {
            let dhcpenable = ((form.getFieldValue("dhcp_enable") && (form.getFieldValue("method") === "0")) ? 1 : 0)
            let dhcp6enable = ((form.getFieldValue("dhcp6_enable") && (form.getFieldValue("method") === "0")) ? form.getFieldValue("dhcp6_enable") : 0)

            buf["dhcp_enable"] = dhcpenable
            buf["dhcp6_enable"] = dhcp6enable

            if (dhcpenable) {
                buf["dhcp_ipaddr"] = form.getFieldValue("dhcp_ipaddr")
                buf["dhcp_submask"] = form.getFieldValue("dhcp_submask")
                buf["dhcp_dns1"] = form.getFieldValue("dhcp_dns1")
                buf["dhcp_dns2"] = form.getFieldValue("dhcp_dns2")
                buf["ipfrom"] = form.getFieldValue("ipfrom")
                buf["ipto"] = form.getFieldValue("ipto")
                buf["dhcp_gateway"] = form.getFieldValue("dhcp_gateway")
                buf["ipleasetime"] = form.getFieldValue("ipleasetime")
            }

            if (dhcp6enable) {
                buf["dhcp6_dns1"] = form.getFieldValue("dhcp6_dns1")
                buf["dhcp6_dns2"] = form.getFieldValue("dhcp6_dns2")
                buf["ip6from"] = form.getFieldValue("ip6from")
                buf["ip6to"] = form.getFieldValue("ip6to")

                let dhcp6PrefixVal = form.getFieldValue("dhcp6_prefix")
                let dhcp6PrefixlenVal = form.getFieldValue("dhcp6_prefixlen")

                buf["dhcp6_prefix"] = dhcp6PrefixVal
                buf["dhcp6_prefixlen"] = dhcp6PrefixlenVal
                buf["lan2_ipaddr6"] = dhcp6PrefixVal
                buf["lan2_ip6_prefixlen"] = dhcp6PrefixlenVal

                buf["ip6leasetime"] = form.getFieldValue("ip6leasetime")
            }
        }

        /*
        // if (checkIfRejectRules(method)) {
            // let all = form.getFieldsValue(['method', 'mtu', 'default_interface', 'altdns',
            //    'lan2_ip_method', 'lan2_ip', 'lan2_mask', 'lan2_gateway', 'lan2_dns1', 'lan2_dns2', 'lan2_username', 'lan2_password', 'lan2_vid', 'lan2_priority',
            //    'lan1_ip_method', 'lan1_ipaddr', 'lan1_submask', 'lan1_gateway', 'lan1_dns1', 'lan1_dns2', 'lan1_username', 'lan1_password', 'lan1_vid', 'lan1_priority',
            //    'dhcp_ipaddr', 'dhcp_submask', 'dhcp_enable', 'dhcp_dns1', 'dhcp_dns2', 'ipfrom', 'ipto', 'dhcp_gateway', 'ipleasetime'])
            let all = form.getFieldsValue()

            let buf = {}
            let methodVal = this.state.network_settings.method

            buf["action"] = "updateNetworkSettings"
            _.each(all, function(num, key) {
                if (key === 'dhcp_enable' || key === 'dhcp6_enable') {
                    buf[key] = num ? "1" : "0"
                } else if (key !== 'mode' && key !== 'identity' && key !== 'md5_secret' && key !== 'lan2.802.1x.mode' && key !== 'lan2.802.1x.identity' && key !== 'lan2.802.1x.username' && key !== 'lan2.802.1x.password') {
                    buf[key] = num
                }
            })
        */
            if (buf["altdns"] === '') {
                buf["altdns"] = "0.0.0.0"
            }
            if (buf["lan1_dns1"] === '') {
                buf["lan1_dns1"] = "0.0.0.0"
            }
            if (buf["lan1_dns2"] === '') {
                buf["lan1_dns2"] = "0.0.0.0"
            }
            if (buf["lan1_vid"] === undefined) {
                buf["lan1_vid"] = ""
            }
            if (buf["lan1_priority"] === undefined) {
                buf["lan1_priority"] = ""
            }
            if (buf["lan2_vid"] === undefined) {
                buf["lan2_vid"] = ""
            }
            if (buf["lan2_priority"] === undefined) {
                buf["lan2_priority"] = ""
            }

            // let method = buf["method"] || "1"
            // let defaultInterface = buf["default_interface"] || "LAN2"

            let flags = false

            _.map(buf, function(num, key) {
                if (err && err.hasOwnProperty(key)) {
                    flags = true
                }
            })
            if (flags) {
                return
            }
            $.ajax({
                type: "post",
                url: baseServerURl,
                data: buf,
                error: function(jqXHR, textStatus, errorThrown) {
                    message.destroy()

                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    const bool = UCMGUI.errorHandler(data, null, formatMessage)

                    if (bool) {
                        let currentInterface = ''

                        if (method === '2') {
                            currentInterface = interfaceObj[method][defaultInterface]
                        } else {
                            currentInterface = interfaceObj[method]
                        }

                        if (lasInterface !== currentInterface) {
                            $.ajax({
                                type: "POST",
                                url: api.apiHost,
                                async: false,
                                data: {
                                    'action': 'confPhddns',
                                    'nicName': currentInterface,
                                    'conffile': ''
                                },
                                error: function(jqXHR, textStatus, errorThrown) {},
                                success: function(data) {
                                    // var bool = UCMGUI.errorHandler(data);

                                    // if (bool) {}
                                }
                            })
                        }
                        __this._saveRes()
                    }
                }
            })
        // }
    }
    _reBoot = () => {
        UCMGUI.loginFunction.confirmReboot()
    }
    _saveRes = () => {
        const { formatMessage } = this.props.intl
        Modal.confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG927" })}}></span>,
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"}),
            onOk: this._reBoot.bind(this)
        })
    }
    _deleteBatchDHCPClient = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        $.ajax({
            url: baseServerURl,
            type: "GET",
            data: {
                action: "deleteBatchDHCPClient",
                mac: 'ALL',
                isbind: 'no'
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    message.success(formatMessage({ id: "LANG5078"}))
                    this._saveChangeCallback()
                }
            }.bind(this)
        })
    }
    _change8021xMethod = (value) => {
         let method = {}

        if (value === "0") {
            method = {
                lan1: 'hidden',
                lan2: 'display-block',
                lantitle: 'hidden',
                lan1title: 'hidden',
                lan2title: 'hidden',
                wantitle: 'display-block'
            }
        } else if (value === "2") {
            method = {
                lan1: 'display-block',
                lan2: 'display-block',
                lantitle: 'hidden',
                lan1title: 'display-block',
                lan2title: 'display-block',
                wantitle: 'hidden'
            }
        } else {
            method = {
                lan1: 'hidden',
                lan2: 'display-block',
                lantitle: 'hidden',
                lan1title: 'hidden',
                lan2title: 'hidden',
                wantitle: 'hidden'
            }
        }

        this.setState({
            method_8021_calss: method
        })
    }
    _setFirstLoad = (e) => {
        this.setState({
            firstLoad: e !== 0 ? true : false
        })
    }
    _onChangeDHCP = (e) => {
        let data = this.state.network_settings
        data.dhcp_enable = e.target.checked
        this.setState({
            network_settings: data
        })
    }
    _changeDHCP6Enable = (e) => {
        let data = this.state.network_settings
        data.dhcp6_enable = e
        this.setState({
            network_settings: data
        })
    }
    _getInitNetwork = () => {
        const { formatMessage } = this.props.intl

        let network_settings = {}
        let dhcp_settings = {}
        let dhcp6_settings = {}

        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "getNetworkSettings"
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    const response = data.response || {}
                    _.each(response.network_settings, function(num, key) {
                        if (key === 'dhcp_enable') {
                            network_settings[key] = num === "1" ? true : false
                        } else {
                            network_settings[key] = num
                        }
                    })
                    dhcp_settings = data.response.dhcp_settings
                    dhcp6_settings = data.response.dhcp6_settings
               }
           }
        })

        let method = network_settings.method
        let method_calss = {}
        if (method === "0") {
            method_calss = {
                lan1: 'hidden',
                lan2: 'display-block',
                lantitle: 'hidden',
                lan1title: 'hidden',
                lan2title: 'hidden',
                wantitle: 'display-block'
            }
        } else if (method === "2") {
            method_calss = {
                lan1: 'display-block',
                lan2: 'display-block',
                lantitle: 'hidden',
                lan1title: 'display-block',
                lan2title: 'display-block',
                wantitle: 'hidden'
            }
        } else {
            method_calss = {
                lan1: 'hidden',
                lan2: 'display-block',
                lantitle: 'hidden',
                lan1title: 'hidden',
                lan2title: 'hidden',
                wantitle: 'hidden'
            }
        }

        this.setState({
            network_settings: network_settings,
            dhcp_settings: dhcp_settings,
            dhcp6_settings: dhcp6_settings,
            method_8021_calss: method_calss
        })
    }
    _handleCancel = () => {
        browserHistory.push('/system-settings/networkSettings')

        this._getInitNetwork()
        this.props.form.resetFields()
        this.setState({
            firstLoad: true
        })
    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        const me = this
        var method = form.getFieldValue("method")
        let activeKey = this.state.activeKey

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (activeKey === "basicSettings") {
                if (method === '0') {
                    let aOldGateway = this.state.dhcp_settings.dhcp_gateway.split('\.')
                    let aNewGateWay = form.getFieldValue("dhcp_gateway").split('\.')

                    if (aOldGateway[0] !== aNewGateWay[0] || aOldGateway[1] !== aNewGateWay[1] || aOldGateway[2] !== aNewGateWay[2]) {
                        $.ajax({
                            url: baseServerURl,
                            type: "GET",
                            data: {
                                action: "checkIfHasMacBind"
                            },
                            success: function(data) {
                                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                                if (bool) {
                                    let bBind = (data.response.hasbind === 'yes')

                                    if (bBind) {
                                        Modal.confirm({
                                            content: formatMessage({id: "LANG5077"}),
                                            okText: formatMessage({id: "LANG727"}),
                                            cancelText: formatMessage({id: "LANG726"}),
                                            onOk: me._deleteBatchDHCPClient.bind(me)
                                        })
                                    } else {
                                        me._saveChangeCallback(err, values)
                                    }
                                }
                            }
                        })
                    } else {
                        me._saveChangeCallback(err, values)
                    }
                } else {
                    me._saveChangeCallback(err, values)
                }
            }
            if (activeKey === "network8021x") {
                me._save8021x(err, values)
            }
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG48"})
                })

        return (
            <div className="app-content-main" id="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG48"}) }
                    onSubmit={ this._handleSubmit.bind(this) }
                    onCancel={ this._handleCancel }
                    isDisplay={ this.state.isDisplay }
                />
                <div className="ant-form form-contain-tab">
                    <Tabs
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChange }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG2217"}) } key="basicSettings">
                            <BasicSettings
                                form={ this.props.form }
                                dataSource={ this.state.network_settings }
                                dataDHCPSettings={ this.state.dhcp_settings }
                                dataDHCP6Settings={ this.state.dhcp6_settings }
                                change8021x={ this._change8021xMethod.bind(this) }
                                dhcpEnable={ this._onChangeDHCP.bind(this) }
                                dhcp6Enable={ this._changeDHCP6Enable.bind(this) }
                                firstLoad={ this.state.firstLoad }
                                setFirstLoad={ this._setFirstLoad.bind(this) }
                            />
                        </TabPane>
                        {
                            model_info.allow_nat !== "0" && this.state.network_settings.method === "0"
                                ? <TabPane tab={formatMessage({id: "LANG4586"})} key="DHCPClient">
                                        <DHCPClient
                                            dataMethod={ this.state.network_settings.method }
                                            dataDHCPEnable={ this.state.network_settings.dhcp_enable }
                                        />
                                    </TabPane>
                                : ''
                        }
                        <TabPane tab={formatMessage({id: "LANG708"})} key="network8021x">
                            <Network8021x
                                form={ this.props.form }
                                class8021x={ this.state.method_8021_calss }
                                firstLoad={ this.state.firstLoad }
                                setFirstLoad={ this._setFirstLoad.bind(this) }
                            />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG3047"})} key="staticRoute">
                                <StaticRoute />
                        </TabPane>
                        {
                            model_info.allow_nat !== "0"
                                ? <TabPane tab={formatMessage({id: "LANG709"})} key="portForwarding">
                                        <PortForwarding />
                                    </TabPane>
                                : ''
                        }
                    </Tabs>
                    <div>
                        <BackTop />
                    </div>
                </div>
            </div>
        )
    }
}

NetWorkSettings.propTypes = {
}

export default Form.create()(injectIntl(NetWorkSettings))

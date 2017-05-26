'use strict'

import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import { Form, Input, Row, Col, Icon, message } from 'antd'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"

const FormItem = Form.Item

class Network extends Component {
    constructor(props) {
        super(props)

        this.state = {
            VPNTitle: "VPN",
            VPN1Title: "WebRTC VPN"
        }
    }
    componentWillMount() {
        const {formatMessage} = this.props.intl
        let networkInformation = {}

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getNetworkInformation' },
            type: 'json',
            async: false,
            success: function(res) {
                networkInformation = res.response
                // dispatch({type: 'GET_NETWORKINFOMATION', networkInformation: networkInformation}) 
            },
            error: function(e) {
                console.log(e.statusText)
            }
        })

        let vpn = networkInformation.vpn || {},
            vpn1 = networkInformation.vpn1 || {}

        let hasVPN = !_.isEmpty(vpn),
            hasWebRTCVPN = !_.isEmpty(vpn1)

        if (hasVPN || hasWebRTCVPN) {
            let content = ""

            if (hasVPN && hasWebRTCVPN) {
                content = formatMessage({id: "LANG4133"}, { 0: "VPN && WebRTC VPN" })
            } else if (hasVPN) {
                content = formatMessage({id: "LANG4133"}, { 0: "VPN" })
            } else {
                content = formatMessage({id: "LANG4133"}, { 0: "WebRTC VPN" })                   
            }

            message.loading(content, 30)

            if (hasVPN) {
                this.checkVPNConnect()
            }

            if (hasWebRTCVPN) {
                this.checkWebRTCVPNConnect()
            }
        }
        this.setState({
            networkInformation: networkInformation
        })
    }
    componentWillUnmount() {

    }
    convertToMAC(mac) {
        if (mac) {
            var macArr = mac.split('')

            return (mac[0] + mac[1] + ":" + mac[2] + mac[3] + ":" + mac[4] + mac[5] + ":" + mac[6] + mac[7] + ":" + mac[8] + mac[9] + ":" + mac[10] + mac[11])
        }
    }
    isUndefined(val) {
        return _.isUndefined(val) ? "hidden" : "display-block"
    }
    isEmpty(val) {
        return _.isEmpty(val) ? "hidden" : "display-block"
    }
    checkVPNConnect() {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'checkVPNConnect' },
            type: 'json',
            async: true,
            success: function(res) {
                const {formatMessage} = this.props.intl

                let data = res

                if (data.status === 0) {
                    message.destroy()
                    message.success("VPN: " + formatMessage({id: "LANG1302"}))
                    
                    this.setState({
                        VPNTitle: (<div><span>VPN</span><span style={{marginLeft: "10px", color: "green"}} dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG1302"}) }} /></div>)
                    })
                } else {
                    message.destroy()
                    message.success("VPN: " + formatMessage({id: "LANG4441"}))
                    
                    this.setState({
                        VPNTitle: (<div><span>VPN</span><span style={{marginLeft: "10px", color: "#ef8700"}} dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4441"}) }} /></div>)
                    })
                }
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    checkWebRTCVPNConnect() {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'checkWebRTCVPNConnect' },
            type: 'json',
            async: true,
            success: function(res) {
                const {formatMessage} = this.props.intl

                let data = res

                if (data.status === 0) {
                    message.destroy()
                    message.success("WebRTC VPN: " + formatMessage({id: "LANG1302"}))
                    
                    this.setState({
                        VPN1Title: (<div style={{marginLeft: "10px", color: "green"}} dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG1302"}) }} />)
                    })
                } else {
                    message.destroy()
                    message.success("WebRTC VPN: " + formatMessage({id: "LANG4441"}))
                    
                    this.setState({
                        VPN1Title: (<div style={{marginLeft: "10px", color: "#ef8700"}} dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4441"}) }} />)
                    })
                }
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    render() {
        const {formatMessage} = this.props.intl

        const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 14 }
            }

        let networkInformation = this.state.networkInformation || {},
            wan = networkInformation.wan || {},
            lan = networkInformation.lan || {},
            lan1 = networkInformation.lan1 || {},
            lan2 = networkInformation.lan2 || {},
            vpn = networkInformation.vpn || {},
            vpn1 = networkInformation.vpn1 || {},
            hdlc1 = networkInformation.hdlc1 || {}

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <Form layout="horizontal">
                        <div ref="wan" className={ this.isEmpty(wan) }>
                            <div className="section-title">{ formatMessage({id: "LANG49"}) }</div>
                            <Row className="row-section-content">
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG154"}) }
                                >
                                    <span ref="wan_mac">
                                        { this.convertToMAC(wan["mac"]) }
                                    </span>
                                </FormItem>
                                <div className={ this.isUndefined(wan["ip"]) }>                                
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5195"}) }
                                    >
                                        <span ref="wan_ip">
                                            { wan["ip"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(wan["ipv6"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5130"}) }
                                    >
                                        <span ref="wan_ipv6">
                                            { wan["ipv6"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(wan["ipv6_link"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5131"}) }
                                    >
                                        <span ref="wan_ipv6_link">
                                            { wan["ipv6_link"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(wan["gateway"]) }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG156"}) }
                                >
                                    <span ref="wan_gateway">
                                        { wan["gateway"] }
                                    </span>
                                </FormItem>
                                </div>
                                <div className={ this.isUndefined(wan["mask"]) }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG157"}) }
                                >
                                    <span ref="wan_mask">
                                        { wan["mask"] }
                                    </span>
                                </FormItem>
                                </div>
                                <div className={ this.isUndefined(wan["dns"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG579"}) }
                                    >
                                        <span ref="wan_dns">
                                            { wan["dns"] }
                                        </span>
                                    </FormItem>
                                </div>
                            </Row>
                        </div>
                        <div ref="lan" className={ this.isEmpty(lan) }>
                            <div className="section-title">{ formatMessage({id: "LANG50"}) }</div>
                            <Row className="row-section-content">
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG154"}) }
                                >
                                    <span ref="lan_mac">
                                        { this.convertToMAC(lan["mac"]) }
                                    </span>
                                </FormItem>
                                <div className={ this.isUndefined(lan["ip"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5195"}) }
                                    >
                                        <span ref="lan_ip">
                                            { lan["ip"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan["ipv6"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5130"}) }
                                    >
                                        <span ref="lan_ipv6">
                                            { lan["ipv6"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan["ipv6_link"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5131"}) }
                                    >
                                        <span ref="lan_ipv6_link">
                                            { lan["ipv6_link"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan["gateway"]) }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG156"}) }
                                >
                                    <span ref="lan_gateway">
                                        { lan["gateway"] }
                                    </span>
                                </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan["mask"]) }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG157"}) }
                                >
                                    <span ref="lan_mask">
                                        { lan["mask"] }
                                    </span>
                                </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan["dns"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG579"}) }
                                    >
                                        <span ref="lan_dns">
                                            { lan["dns"] }
                                        </span>
                                    </FormItem>
                                </div>
                            </Row>
                        </div>
                        <div ref="lan1" className={ this.isEmpty(lan1) }>
                            <div className="section-title">{"LAN 1"}</div>
                            <Row className="row-section-content">
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG154"}) }
                                >
                                    <span ref="lan1_mac">
                                        { this.convertToMAC(lan1["mac"]) }
                                    </span>
                                </FormItem>
                                <div className={ this.isUndefined(lan1["ip"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5195"}) }
                                    >
                                        <span ref="lan1_ip">
                                            { lan1["ip"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan1["ipv6"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5130"}) }
                                    >
                                        <span ref="lan1_ipv6">
                                            { lan1["ipv6"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan1["ipv6_link"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5131"}) }
                                    >
                                        <span ref="lan1_ipv6_link">
                                            { lan1["ipv6_link"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan1["gateway"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG156"}) }
                                    >
                                        <span ref="lan1_gateway">
                                            { lan1["gateway"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan1["mask"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG157"}) }
                                    >
                                        <span ref="lan1_mask">
                                            { lan1["mask"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan1["dns"]) }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG579"}) }
                                    >
                                        <span ref="lan1_dns">
                                            { lan1["dns"] }
                                        </span>
                                    </FormItem>
                                </div>
                            </Row>
                        </div>
                        <div ref="lan2" className={ this.isEmpty(lan2) }>
                            <div className="section-title">{ formatMessage({id: "LANG3060"}) }</div>
                            <Row className="row-section-content">
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG154"}) }
                                >
                                    <span ref="lan2_mac">
                                        {this.convertToMAC(lan2["mac"])}
                                    </span>
                                </FormItem>
                                <div className={ this.isUndefined(lan2["ip"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5195"}) }
                                    >
                                        <span ref="lan2_ip">
                                            { lan2["ip"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan2["ipv6"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5130"}) }
                                    >
                                        <span ref="lan2_ipv6">
                                            { lan2["ipv6"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan2["ipv6_link"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5131"}) }
                                    >
                                        <span ref="lan2_ipv6_link">
                                            { lan2["ipv6_link"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan2["gateway"]) }> 
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG156"}) }
                                >
                                    <span ref="lan2_gateway">
                                        { lan2["gateway"] }
                                    </span>
                                </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan2["mask"]) }> 
                                <FormItem
                                    { ...formItemLayout }
                                    label={ formatMessage({id: "LANG157"}) }
                                >
                                    <span ref="lan2_mask">
                                        { lan2["mask"] }
                                    </span>
                                </FormItem>
                                </div>
                                <div className={ this.isUndefined(lan2["dns"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG579"}) }
                                    >
                                        <span ref="lan2_dns">
                                            { lan2["dns"] }
                                        </span>
                                    </FormItem>
                                </div>
                            </Row>
                        </div>
                        <div ref="vpn" className={ this.isEmpty(vpn) }>
                            <div ref="VPNTitle" className="section-title">{this.state.VPNTitle}</div>
                            <Row className="row-section-content">
                                <div className={ this.isUndefined(vpn["ip"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5195"}) }
                                    >
                                        <span ref="vpn_ip">
                                            { vpn["ip"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(vpn["route"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG550"}) }
                                    >
                                        <span ref="vpn_route">
                                            { vpn["route"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(vpn["mask"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG157"}) }
                                    >
                                        <span ref="vpn_mask">
                                            { vpn["mask"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(vpn["ptp"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG4009"}) }
                                    >
                                        <span ref="vpn_ptp">
                                            { vpn["ptp"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(vpn["dns"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG579"}) }
                                    >
                                        <span ref="LANG579">
                                            { vpn["dns"] }
                                        </span>
                                    </FormItem>
                                </div>
                            </Row>
                        </div>
                        <div ref="vpn1" className={ this.isEmpty(vpn1) }>
                            <div ref="VPN1Title" className="section-title">{this.state.VPN1Title}</div>
                            <Row className="row-section-content">
                                <div className={ this.isUndefined(vpn1["ip"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5195"}) }
                                    >
                                        <span ref="vpn1_ip">
                                            { vpn1["ip"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(vpn1["route"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG550"}) }
                                    >
                                        <span ref="vpn1_route">
                                            { vpn1["route"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(vpn1["mask"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG157"}) }
                                    >
                                        <span ref="vpn1_mask">
                                            { vpn1["mask"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(vpn1["ptp"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG4009"}) }
                                    >
                                        <span ref="vpn1_ptp">
                                            { vpn1["ptp"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(vpn1["dns"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG579"}) }
                                    >
                                        <span ref="vpn1_dns">
                                            { vpn1["dns"] }
                                        </span>
                                    </FormItem>
                                </div>
                            </Row>
                        </div>
                        <div ref="hdlc1" className={ this.isEmpty(hdlc1) }>
                            <div className="section-title">{ formatMessage({id: "LANG3572"}) }</div>
                            <Row className="row-section-content">
                                <div className={ this.isUndefined(hdlc1["ip"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG5195"}) }
                                    >
                                        <span ref="hdlc1_ip">
                                            { hdlc1["ip"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(hdlc1["gateway"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG156"}) }
                                    >
                                        <span ref="hdlc1_gateway">
                                            { hdlc1["gateway"] }
                                        </span>
                                    </FormItem>
                                </div>
                                 <div className={ this.isUndefined(hdlc1["mask"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG157"}) }
                                    >
                                        <span ref="hdlc1_mask">
                                            { hdlc1["mask"] }
                                        </span>
                                    </FormItem>
                                </div>
                                <div className={ this.isUndefined(hdlc1["dns"]) }> 
                                    <FormItem
                                        { ...formItemLayout }
                                        label={ formatMessage({id: "LANG579"}) }
                                    >
                                        <span ref="hdlc1_dns">
                                            { hdlc1["dns"] }
                                        </span>
                                    </FormItem>
                                </div>
                            </Row>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

Network.propTypes = {
}

export default Form.create()(injectIntl(Network))


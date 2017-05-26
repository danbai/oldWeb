'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
import _ from 'underscore'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

class CreateVoipTrunk extends Component {
    constructor(props) {
        super(props)
        this.state = {
            trunkType: "peer",
            telUri: "disabled",
            enableCc: false
        }
    }
    componentDidMount() {
        this._getNameList()
    }
    componentWillUnmount() {

    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl
        
        let mode = this.props.params.mode,
            action = {}

        if (mode === "addSip") {
            action["action"] = "addSIPTrunk"
            action["technology"] = "SIP"
        } else if (mode === "addIax") {
            action["action"] = "addIAXTrunk"
            action["technology"] = "IAX"
        } 

        action["trunk_type"] = this.state.trunkType

        this.props.form.validateFieldsAndScroll((err, values) => {
            let me = this

            for (let key in values) {
                if (values.hasOwnProperty(key)) {
                    if (me.refs["div_" + key] && 
                        me.refs["div_" + key].props &&
                        ((me.refs["div_" + key].props.className &&
                        me.refs["div_" + key].props.className.indexOf("hidden") === -1) ||
                        typeof me.refs["div_" + key].props.className === "undefined")) {
                        if (!err || (err && typeof err[key] === "undefined")) {
                            action[key] = UCMGUI.transCheckboxVal(values[key])   
                        } else {
                            return
                        }
                    }
                }
            }

            console.log('Received values of form: ', values)

            message.loading(formatMessage({ id: "LANG826" }), 0)

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
                        browserHistory.push('/extension-trunk/voipTrunk')
                    }
                }.bind(this)
            })
        })
    }
    _onChangeTrunkType = (val) => {
        this.setState({
            trunkType: val
        })      
    }
    _onChangeTelUri = (val) => {
        this.setState({
            telUri: val
        })  
    }
    // _onChangeEnableCc = (val) => {
    //     this.setState({
    //         enableCc: val
    //     })  
    // }
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
        if (_.find(this.state.trunkNameList, function (num) { 
            return num === value
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
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        let mode = this.props.params.mode

        return (
            <div className="app-content-main" id="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG2908"}) } onSubmit={ this._handleSubmit.bind(this) } onCancel={ this._handleCancel } isDisplay='display-block' />
                <Form>
                    <FormItem
                        ref="div_trunk_type"
                        { ...formItemLayout }
                        label={ formatMessage({id: "LANG84"}) }>
                        {(() => {
                            switch (mode) {
                                case "addSip": 
                                    return (
                                        <Select ref="trunk_type" defaultValue="peer" onChange={this._onChangeTrunkType}>
                                            <Option value="peer">{ formatMessage({id: "LANG233"}) }</Option>
                                            <Option value="register">{ formatMessage({id: "LANG234"}) }</Option>
                                        </Select>
                                    )
                                case "addIax": 
                                    return (
                                        <Select ref="trunk_type" defaultValue="peer" onChange={this._onChangeTrunkType}>
                                            <Option value="peer">{ formatMessage({id: "LANG235"}) }</Option>
                                            <Option value="register">{ formatMessage({id: "LANG236"}) }</Option>
                                        </Select>
                                    )
                                default: return
                            }
                        })()}
                    </FormItem>
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
                            initialValue: ""
                        })(
                            <Input maxLength="16" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_host"
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG1374" />}>
                                <span>{ formatMessage({id: "LANG1373"}) }</span>
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
                                    let hostName = formatMessage({
                                            id: "LANG1373"
                                        }).toLowerCase(),
                                        rightIpMsg = formatMessage({
                                            id: "LANG2167"
                                        }, {
                                            0: hostName
                                        })

                                    Validator.host(data, value, callback, hostName)
                                }
                            }, { 
                                validator: (data, value, callback) => {
                                    let hostName = formatMessage({
                                            id: "LANG1373"
                                        }).toLowerCase(),

                                        selfIpErrMsg = formatMessage({
                                            id: "LANG2542"
                                        }, {
                                            0: hostName
                                        }),

                                        rightIpMsg = formatMessage({
                                            id: "LANG2167"
                                        }, {
                                            0: hostName
                                        })

                                    this._isRightIP(data, value, callback, rightIpMsg)
                                }
                            }, { 
                                validator: (data, value, callback) => {
                                    let hostName = formatMessage({
                                            id: "LANG1373"
                                        }).toLowerCase(),

                                        selfIpErrMsg = formatMessage({
                                            id: "LANG2542"
                                        }, {
                                            0: hostName
                                        })

                                    this._isSelfIP(data, value, callback, selfIpErrMsg)
                                }
                            }],
                            initialValue: ""
                        })(
                            <Input maxLength="60" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_transport"
                        className="hidden"
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG1391" />}>
                                <span>{formatMessage({id: "LANG1392"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('transport', {
                            rules: [],
                            initialValue: "udp"
                        })(
                            <Select>
                                 <Option value="udp">{formatMessage({id: "LANG1401"})}</Option>
                                 <Option value="tcp">{formatMessage({id: "LANG1402"})}</Option>
                                 <Option value="tls">{formatMessage({id: "LANG1403"})}</Option>
                                 {/* <Option value="udp,tcp,tls" locale="LANG1404">All - UDP Primary</Option>
                                 <Option value="tcp,udp,tls" locale="LANG1405">All - TCP Primary</Option>
                                 <Option value="tls,udp,tcp" locale="LANG1406">All - TLS Primary</Option> */}
                             </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_keeporgcid"
                        className={mode === "addIax" ? "hidden" : "display-block"}
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG4109" />}>
                                <span>{formatMessage({id: "LANG4108"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('keeporgcid', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: false
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
                            initialValue: (this.state.trunkType === "register" && mode === "addSip") ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_nat"
                        className={mode === "addIax" ? "hidden" : "display-block"}
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG1093" />}>
                                <span>{formatMessage({id: "LANG5036"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('nat', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: false
                        })(
                            <Checkbox id="nat"/>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_out_of_service"
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG3480" />}>
                                <span>{formatMessage({id: "LANG2757"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('out_of_service', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_tel_uri"
                        className={mode === "addIax" ? "hidden" : "display-block"}
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG2769" />}>
                                <span>{formatMessage({id: "LANG2768"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('tel_uri', {
                            rules: [],
                            initialValue: "disabled"
                        })(
                            <Select onChange={ this._onChangeTelUri}>
                                <Option value='disabled'>{formatMessage({id: "LANG2770"})}</Option>
                                <Option value='user_phone'>{formatMessage({id: "LANG2771"})}</Option>
                                <Option value='enabled'>{formatMessage({id: "LANG2772"})}</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_need_register"
                        className={ (this.state.trunkType === "register" && mode === "addSip") ? "display-block" : "hidden"}
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG3016" />}>
                                <span>{formatMessage({id: "LANG3015"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('need_register', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: (this.state.trunkType === "register" && mode === "addSip") ? true : false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_allow_outgoing_calls_if_reg_failed"
                        className={ (this.state.trunkType === "register" && mode === "addSip") ? "display-block" : "hidden"}
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG5070" />}>
                                <span>{formatMessage({id: "LANG5069"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('allow_outgoing_calls_if_reg_failed', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: true
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_cidnumber"
                        className={this.state.trunkType === "peer" ? "display-block" : "hidden"}
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
                                        let isChecked = this.props.form.getFieldValue("keepcid")

                                        if ((isChecked && value !== "") || !isChecked) {
                                            callback()
                                        } else {                                            
                                            callback(formatMessage({id: "LANG5066"}))
                                        }
                                }
                            }],
                            initialValue: ""
                        })(
                            <Input maxLength="64" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_cidname"
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
                            initialValue: ""
                        })(
                            <Input maxLength="64" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_fromdomain"
                        className="hidden"
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
                                    Validator.host(data, value, callback, formatMessage, formatMessage({ id: "LANG1369"}).toLowerCase())
                                }
                            }],
                            initialValue: ""
                        })(
                            <Input maxLength="60" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_fromuser"
                        className="hidden"
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
                            initialValue: ""
                        })(
                            <Input maxLength="64" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_username"
                        className={ this.state.trunkType === "register" ? "display-block" : "hidden"}
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
                            initialValue: ""
                        })(
                            <Input maxLength="64" autoComplete="off" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_secret"
                        className={ this.state.trunkType === "register" ? "display-block" : "hidden"}
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
                            initialValue: ""
                        })(
                            <Input type="password" maxLength="64" autoComplete="off" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_authid"
                        className={ (this.state.trunkType === "register" && mode === "addSip") ? "display-block" : "hidden"}
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
                            initialValue: ""
                        })(
                            <Input maxLength="64" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_auth_trunk"
                        className={ (this.state.trunkType === "register" && mode === "addSip") ? "display-block" : "hidden" }
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG4262" />}>
                                <span>{formatMessage({id: "LANG4261"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('auth_trunk', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_auto_recording"
                        className={mode === "addIax" ? "hidden" : "display-block"}
                        { ...formItemLayout }
                        label={                            
                            <Tooltip title={<FormattedHTMLMessage id="LANG5266" />}>
                                <span>{formatMessage({id: "LANG2543"})}</span>
                            </Tooltip>
                        }>
                        { getFieldDecorator('auto_recording', {
                            rules: [],
                            valuePropName: "checked",
                            initialValue: false
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                        {/* <div>
                            <FormItem
                                ref="div_outboundproxy"
                                className={ (this.state.trunkType === "register" && mode === "addSip") ? "display-block" : "hidden"}
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
                                            Validator.host(data, value, callback, formatMessage, formatMessage({
                                                id: "LANG1378"
                                            }).toLowerCase())
                                            let msg = formatMessage({id: "LANG2542"}, {0: formatMessage({id: "LANG1378"})})
                                            this._isSelfIP(data, value, callback, msg)
                                        }
                                    }],
                                    initialValue: ""
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                            <FormItem
                                id="div_rmv_obp_from_route"
                                className={ (this.state.trunkType === "register" && mode === "addSip") ? "display-block" : "hidden"}
                                { ...formItemLayout }
                                label={                            
                                    <Tooltip title={<FormattedHTMLMessage id="LANG5030" />}>
                                        <span>{formatMessage({id: "LANG5029"})}</span>
                                    </Tooltip>
                                }>
                                { getFieldDecorator('rmv_obp_from_route', {
                                    rules: [],
                                    initialValue: ""
                                })(
                                    <Input disabled={ this.state.telUri !== "disabled" ? true : false } />
                                ) }
                            </FormItem>
                        </div> */}
                    {/*  ccss for trunk  */}
                    {/* <div id="ccss" className="hidden">
                        <div className='section-title'>{ formatMessage({id: "LANG3725"}) }</div>
                        <FormItem
                            ref="div_enable_cc"
                            className="hidden"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3727" /> }>
                                    <span>{ formatMessage({id: "LANG3726"}) }</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('enable_cc', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: false
                            })(
                                <Checkbox onChange={this._onChangeEnableCc} />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_cc_max_agents"
                            className={ this.state.enableCc === true ? "display-block" : "hidden" }
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
                                    type: 'integer',
                                    required: true, 
                                    message: formatMessage({id: "LANG2150"}) 
                                }],
                                initialValue: ""
                            })(
                                <Input maxLength="10" />
                            ) }
                        </FormItem>
                        <FormItem
                            id="div_cc_max_monitors"
                            className={ this.state.enableCc === true ? "display-block" : "hidden" }
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
                                    type: 'integer', 
                                    required: true, 
                                    message: formatMessage({id: "LANG2150"}) 
                                }],
                                initialValue: ""
                            })(
                                <Input maxLength="10" />
                            ) }
                        </FormItem>
                    </div> */}     
                    {/* ended of  ccss for trunk */} 
                </Form>
            </div>
        )
    }
}

CreateVoipTrunk.propTypes = {
}

export default Form.create()(injectIntl(CreateVoipTrunk))
'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Button, Col, Form, Input, Row, message, Transfer, Tooltip, Checkbox, Icon, Modal, Select} from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class ZeroConfigSettings extends Component {
    constructor(props) {
        super(props)

        this.state = {
            enableZeroConfig: false,
            enableAutoConfigAssign: false,
            enableAutoExtAssign: false,
            enablePickExt: false,
            pickExtPeriod: null,
            zcExtRange: [],
            pickExtRange: [],
            subnet0: null,
            subnet1: null,
            subnet2: null,
            subnet3: null,
            subnet4: null,
            subnetList: []
        }
    }
    componentDidMount() {
        this._getZeroConfigSettings()
        this._getExtPrefSettings()
    }
    componentWillUnmount() {

    }
    _getZeroConfigSettings = () => {
        const { formatMessage } = this.props.intl
        const zeroConfigSettings = UCMGUI.isExist.getList("getZeroConfigSettings", formatMessage)
        const enableZeroConfig = (zeroConfigSettings.hasOwnProperty('enable_zeroconfig') && zeroConfigSettings.enable_zeroconfig === "1") ? true : false
        const enableAutoConfigAssign = (zeroConfigSettings.zc_settings.hasOwnProperty('auto_conf_assign') && zeroConfigSettings.zc_settings.auto_conf_assign === 1) ? true : false
        const enableAutoExtAssign = (zeroConfigSettings.zc_settings.hasOwnProperty('auto_assign') && zeroConfigSettings.zc_settings.auto_assign === "yes") ? true : false
        const enablePickExt = (zeroConfigSettings.zc_settings.hasOwnProperty('enable_pick') && zeroConfigSettings.zc_settings.enable_pick === "yes") ? true : false

        let pickExtPeriod = null  

        if (enablePickExt) {
            pickExtPeriod = zeroConfigSettings.zc_settings.pick_period

            if (pickExtPeriod < 0.1) {
                pickExtPeriod = 0.1
            }

            pickExtPeriod = Math.round(pickExtPeriod * Math.pow(10, 1)) / Math.pow(10, 1)
        }

        let subnetWhiteList = []
        const subnet0 = (zeroConfigSettings.zc_settings.hasOwnProperty('subnet0') && zeroConfigSettings.zc_settings.subnet0 !== null) ? zeroConfigSettings.zc_settings.subnet0 : ""

        subnetWhiteList.push(subnet0)

        const subnet1 = (zeroConfigSettings.zc_settings.hasOwnProperty('subnet1') && zeroConfigSettings.zc_settings.subnet1 !== null) ? zeroConfigSettings.zc_settings.subnet1 : null

        if (subnet1) {
            subnetWhiteList.push(subnet1)
        }

        const subnet2 = (zeroConfigSettings.zc_settings.hasOwnProperty('subnet2') && zeroConfigSettings.zc_settings.subnet2 !== null) ? zeroConfigSettings.zc_settings.subnet2 : null

        if (subnet2) {
            subnetWhiteList.push(subnet2)
        }

        const subnet3 = (zeroConfigSettings.zc_settings.hasOwnProperty('subnet3') && zeroConfigSettings.zc_settings.subnet3 !== null) ? zeroConfigSettings.zc_settings.subnet3 : null

        if (subnet3) {
            subnetWhiteList.push(subnet3)
        }

        const subnet4 = (zeroConfigSettings.zc_settings.hasOwnProperty('subnet4') && zeroConfigSettings.zc_settings.subnet4 !== null) ? zeroConfigSettings.zc_settings.subnet4 : null

        if (subnet4) {
            subnetWhiteList.push(subnet4)
        }

        this.setState({
            enableZeroConfig: enableZeroConfig,
            enableAutoConfigAssign: enableAutoConfigAssign,
            enableAutoExtAssign: enableAutoExtAssign,
            enablePickExt: enablePickExt,
            pickExtPeriod: pickExtPeriod,
            subnetList: subnetWhiteList
        })
    }
    _getExtPrefSettings = () => {
        let prefSetting = {}
        let zcExtStart = this.state.zcExtRange[0]
        let zcExtEnd = this.state.zcExtRange[1]
        let pickExtStart = this.state.pickExtRange[0]
        let pickExtEnd = this.state.pickExtRange[1]

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getExtenPrefSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    prefSetting = res.response.extension_pref_settings || {}
                    zcExtStart = prefSetting.zcue_start
                    zcExtEnd = prefSetting.zcue_end
                    pickExtStart = prefSetting.pkue_start
                    pickExtEnd = prefSetting.pkue_end

                    this.setState({
                        zcExtRange: [zcExtStart, zcExtEnd],
                        pickExtRange: [pickExtStart, pickExtEnd]
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    onChange(activeKey) {
        if (activeKey === "1") {

        } else {            
            
        }
    }
    _handleSubmit = () => {
        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = {
                    action: 'updateZeroConfigSettings'
                }

                action.enable_zeroconfig = values.enablezc ? '1' : '0'
                action.auto_conf_assign = values.enableAutoConfigAssign ? '1' : '0'
                action.auto_assign = values.enableAutoExtAssign ? 'yes' : 'no'
                action.enable_pick = values.enablePickExt ? 'yes' : 'no'
                action.pick_period = values.pickExtPeriod
                action.subnet0 = values.subnet0
                action.subnet1 = values.subnet1
                action.subnet2 = values.subnet2
                action.subnet3 = values.subnet3
                action.subnet4 = values.subnet4

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
                            message.success(<span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG815" }) }}></span>)
                        }
                    }.bind(this)
                }) 
            }
        })
    }
    _handleCancel = () => {
    }
    _toggleZeroconfig = () => {
        const enableZeroConfigPrev = this.state.enableZeroConfig

        this.setState({
            enableZeroConfig: !enableZeroConfigPrev
        })
    }
    _togglePickExt = () => {
        const enablePickExtPrev = this.state.enablePickExt

        this.setState({
            enablePickExt: !enablePickExtPrev 
        })
    }
    _promptGeneralPage = () => {
        const { formatMessage } = this.props.intl

        confirm({
            okText: formatMessage({id: "LANG727" }),
            cancelText: formatMessage({id: "LANG726" }),
            content: <span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG843" }, { 0: formatMessage({id: "LANG3"}) }) }}></span>,
            onCancel() {},
            onOk() {
                browserHistory.push('/pbx-settings/pbxGeneralSettings')
            }
        })

        return false
    }
    _addSubnet = () => {
        let tmp_subnetList = this.state.subnetList
        const { formatMessage } = this.props.intl

        if (tmp_subnetList.length >= 5) {
            message.error(formatMessage({ id: "LANG5238" }))
        } else {
            tmp_subnetList.push("")
        }

        this.setState({
            subnetList: tmp_subnetList
        })
    }
    _removeSubnet = (index) => {
        let tmp_subnetList = this.state.subnetList

        tmp_subnetList.splice(index, 1)

        this.setState({
            subnetList: tmp_subnetList
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const enableZeroConfig = this.state.enableZeroConfig
        const enableAutoConfigAssign = this.state.enableAutoConfigAssign
        const enableAutoExtAssign = this.state.enableAutoExtAssign
        const zcExtRange = this.state.zcExtRange           
        const enablePickExt = this.state.enablePickExt
        const pickExtRange = this.state.pickExtRange
        const pickExtPeriod = this.state.pickExtPeriod
        const subnetWhiteNameList = this.state.subnetWhiteNameList
        const subnetWhiteIPList = this.state.subnetWhiteIPList
        
        const subnetList = this.state.subnetList
        const subnet0 = subnetList[0]
        const subnet1 = subnetList.length > 1 ? subnetList[1] : null
        const subnet2 = subnetList.length > 2 ? subnetList[2] : null
        const subnet3 = subnetList.length > 3 ? subnetList[3] : null
        const subnet4 = subnetList.length > 4 ? subnetList[4] : null

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }
        const formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        }
        const formItemWithoutLabelLayout = {
            wrapperCol: { span: 6, offset: 4 }
        }

        return (
            <div className="app-content-main" id="app-content-main">
                {/* <Title
                    isDisplay='display-block'
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    headerTitle={ formatMessage({id: "LANG3904"}) }
                /> */}
                <div className="content">
                    <Form>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG2217"}) }</span>
                        </div>
                        <FormItem
                            ref="div_enablezc"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1311" /> }>
                                    <span>{ formatMessage({id: "LANG1311"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('enablezc', {
                                width: 100,
                                valuePropName: 'checked',
                                initialValue: enableZeroConfig
                            })(
                                <Checkbox onChange={ this._toggleZeroconfig } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_enableAutoConfigAssign"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3906" /> }>
                                    <span>{ formatMessage({id: "LANG3702"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('enableAutoConfigAssign', {
                                width: 100,
                                valuePropName: 'checked',
                                initialValue: enableAutoConfigAssign
                            })(
                                <Checkbox disabled={ !enableZeroConfig } />
                            ) }
                        </FormItem>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG3905"}) }</span>
                        </div>
                        <div className="lite-desc">
                            <FormattedHTMLMessage id="LANG1304" />
                        </div>
                        <FormItem
                            ref="div_enableAutoExtAssign"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1308" /> }>
                                    <span>{ formatMessage({id: "LANG1307"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('enableAutoExtAssign', {
                                width: 100,
                                valuePropName: 'checked',
                                initialValue: enableAutoExtAssign
                            })(
                                <Checkbox disabled={ !enableZeroConfig } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayoutRow }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1156" /> }>
                                    <span>{ formatMessage({id: "LANG2713"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={ 3 }>
                                <span>
                                    { zcExtRange[0]} - {zcExtRange[1] }
                                </span>
                            </Col>
                            <Col span={ 21 }>
                                <a
                                    href="#"
                                    className="ant-dropdown-link"
                                    onClick={ this._promptGeneralPage }
                                >
                                    { formatMessage({id: "LANG2713"}) }
                                </a>
                            </Col>
                        </FormItem>
                        <FormItem
                            ref="div_enablePickExt"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2441" /> }>
                                    <span>{ formatMessage({id: "LANG2440"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('enablePickExt', {
                                width: 100,
                                valuePropName: 'checked',
                                initialValue: enablePickExt
                            })(
                                <Checkbox onChange={ this._togglePickExt } disabled={ !enableZeroConfig } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayoutRow }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2443" /> }>
                                    <span>{ formatMessage({id: "LANG2442"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={ 3 }>
                                <span>
                                    { pickExtRange[0]} - {pickExtRange[1] }
                                </span>
                            </Col>
                            <Col span={ 21 }>
                                <a
                                    href="#"
                                    className="ant-dropdown-link"
                                    onClick={ this._promptGeneralPage }
                                >
                                    { formatMessage({id: "LANG2442"}) }
                                </a>
                            </Col>
                        </FormItem>
                        <FormItem
                            ref="div_pickExtPeriod"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2670" /> }>
                                    <span>{ formatMessage({id: "LANG2668"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('pickExtPeriod', {
                                initialValue: pickExtPeriod
                            })(
                                <Input disabled={ !enableZeroConfig || !enablePickExt } />
                            ) }
                        </FormItem>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG48"}) }</span>
                        </div>
                        <FormItem
                            ref="div_subnetTable"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5235" /> }>
                                    <span>{ formatMessage({id: "LANG5237"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={ 16 }>
                                { getFieldDecorator('subnet0', {
                                    rules: [],
                                    initialValue: subnetList[0]
                                })(
                                    <Input disabled={ !enableZeroConfig } />
                                ) }
                            </Col>
                            <Col span={ 1 } offset={ 1 }>
                                <Icon
                                    className="dynamic-plus-button"
                                    type="plus-circle-o"
                                    onClick={ this._addSubnet }
                                />
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemWithoutLabelLayout }
                            className= { subnet1 !== null ? 'display-block' : 'hidden'}
                        >
                            <Col span={ 16 }>
                                { getFieldDecorator(`subnet1`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: subnet1 !== null,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: subnet1 ? subnet1 : ''
                                })(
                                    <Input disabled={ !enableZeroConfig } />
                                ) }
                            </Col>
                            <Col span={ 1 } offset={ 1 }>
                                <Icon
                                    type="minus-circle-o"
                                    className="dynamic-delete-button"
                                    onClick={ this._removeSubnet.bind(this, 1) }
                                />
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemWithoutLabelLayout }
                            className= { subnet2 !== null ? 'display-block' : 'hidden'}
                        >
                            <Col span={ 16 }>
                                { getFieldDecorator(`subnet2`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: subnet2 !== null,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: subnet2 ? subnet2 : ''
                                })(
                                    <Input disabled={ !enableZeroConfig } />
                                ) }
                            </Col>
                            <Col span={ 1 } offset={ 1 }>
                                <Icon
                                    type="minus-circle-o"
                                    className="dynamic-delete-button"
                                    onClick={ this._removeSubnet.bind(this, 2) }
                                />
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemWithoutLabelLayout }
                            className= { subnet3 !== null ? 'display-block' : 'hidden'}
                        >
                            <Col span={ 16 }>
                                { getFieldDecorator(`subnet3`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: subnet3 !== null,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: subnet3 ? subnet3 : ''
                                })(
                                    <Input disabled={ !enableZeroConfig } />
                                ) }
                            </Col>
                            <Col span={ 1 } offset={ 1 }>
                                <Icon
                                    className="dynamic-delete-button"
                                    type="minus-circle-o"
                                    onClick={ this._removeSubnet.bind(this, 3) }
                                />
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemWithoutLabelLayout }
                            className= { subnet4 !== null ? 'display-block' : 'hidden'}
                        >
                            <Col span={ 16 }>
                                { getFieldDecorator(`subnet4`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: subnet4 !== null,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: subnet4 ? subnet4 : ''
                                })(
                                    <Input disabled={ !enableZeroConfig } />
                                ) }
                            </Col>
                            <Col span={ 1 } offset={ 1 }>
                                <Icon
                                    type="minus-circle-o"
                                    className="dynamic-delete-button"
                                    onClick={ this._removeSubnet.bind(this, 4) }
                                />
                            </Col>
                        </FormItem>
                        <FormItem
                            style={{ marginTop: '20px' }}
                          { ...formItemWithoutLabelLayout }
                        >
                            <Button type="primary" onClick={ this._handleSubmit } className="save">
                                { formatMessage({id: "LANG728"}) }
                            </Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

ZeroConfigSettings.propTypes = {
}

export default Form.create()(injectIntl(ZeroConfigSettings))
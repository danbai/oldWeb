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
import { Checkbox, Col, Form, Input, Icon, message, Row, Select, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class Media extends Component {
    constructor(props) {
        super(props)

        let faxmode = 'no'
        let custom_alert_info = ''
        let settings = this.props.settings
        let alertinfo = settings.alertinfo
        let strategy_ipacl = settings.strategy_ipacl
        let targetKeys = settings.allow
                            ? settings.allow
                            : 'ulaw,alaw,gsm,g726,g722,g729,h264,ilbc'

        if (alertinfo && alertinfo.indexOf('custom') > -1) {
            custom_alert_info = alertinfo.slice(7)
            alertinfo = 'custom'
        } else {
            alertinfo = alertinfo ? alertinfo : 'none'
        }

        if (settings.faxdetect === 'no' && settings.fax_gateway !== 'yes') {
            faxmode = 'no'
        } else if (settings.faxdetect === 'yes') {
            faxmode = 'detect'
        } else if (settings.fax_gateway === 'yes') {
            faxmode = 'gateway'
        }

        this.state = {
            faxmode: faxmode,
            alertinfo: alertinfo,
            custom_alert_info: custom_alert_info,
            targetKeys: targetKeys ? targetKeys.split(',') : [],
            strategy_ipacl: strategy_ipacl ? strategy_ipacl.toString() : '0',
            availableCodecs: [
                {
                    key: 'g726aal2', title: 'AAL2-G.726-32'
                }, {
                    key: 'adpcm', title: 'ADPCM'
                }, {
                    key: 'g723', title: 'G.723'
                }, {
                    key: 'h263', title: 'H.263'
                }, {
                    key: 'h263p', title: 'H.263p'
                }, {
                    key: 'vp8', title: 'VP8'
                }, {
                    key: 'opus', title: 'OPUS'
                }, {
                    key: 'ulaw', title: 'PCMU'
                }, {
                    key: 'alaw', title: 'PCMA'
                }, {
                    key: 'gsm', title: 'GSM'
                }, {
                    key: 'g726', title: 'G.726'
                }, {
                    key: 'g722', title: 'G.722'
                }, {
                    key: 'g729', title: 'G.729'
                }, {
                    key: 'h264', title: 'H.264'
                }, {
                    key: 'ilbc', title: 'iLBC'
                }
            ]
        }
    }
    componentDidMount() {
    }
    componentWillMount() {
    }
    _addLocalNetwork = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        // can use data-binding to get
        const localNetworks = form.getFieldValue('localNetworks')

        if (localNetworks.length <= 8) {
            const newLocalNetworks = localNetworks.concat(this._generateLocalNetworkID(localNetworks))

            // can use data-binding to set
            // important! notify form to detect changes
            form.setFieldsValue({
                localNetworks: newLocalNetworks
            })
        } else {
            message.warning(formatMessage({id: "LANG948"}))

            return false
        }
    }
    _checkNetwork = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let regSubnet = /^((1\d\d|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.){3}0$/
        let regIpv6 = /^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))(\/\d+)$/ // test ipv6
        
        if (!val || (val && (regSubnet.test(val) || regIpv6.test(val)))) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2131"}))
        }
    }
    _checkNetworkNumber = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let error = false
        let regIpv6 = /^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?(\/\d+)$/ // test ipv6

        if (val && regIpv6.test(val)) {
            let arr = val.split('/')
            let num = arr[1]

            if (num && parseInt(num) > 128) {
                error = true
            }
        }

        if (error) {
            callback(formatMessage({id: "LANG5247"}))
        } else {
            callback()
        }
    }
    _filterCodecsSource = () => {
        if (this.props.extensionType === 'iax') {
            return _.filter(this.state.availableCodecs, function(item) {
                    return item.key !== 'opus'
                })
        } else {
            return this.state.availableCodecs
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _generateLocalNetworkID = (existIDs) => {
        let newID = 2
        const keyList = _.pluck(existIDs, 'key')

        if (keyList && keyList.length) {
            newID = _.find([2, 3, 4, 5, 6, 7, 8, 9, 10], function(key) {
                    return !_.contains(keyList, key)
                })
        }

        return {
                new: true,
                key: newID
            }
    }
    _handleTransferChange = (targetKeys, direction, moveKeys) => {
        const { form } = this.props

        this.setState({
            targetKeys: targetKeys
        })

        form.setFieldsValue({
            allow: targetKeys.toString()
        })

        console.log('targetKeys: ', targetKeys)
        console.log('direction: ', direction)
        console.log('moveKeys: ', moveKeys)
    }
    _handleTransferSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        // this.setState({ targetContactKeys: nextTargetKeys })
        console.log('sourceSelectedKeys: ', sourceSelectedKeys)
        console.log('targetSelectedKeys: ', targetSelectedKeys)
    }
    _onChangeAlertInfo = (value) => {
        this.setState({
            alertinfo: value
        })
    }
    _onChangeStrategy = (value) => {
        this.setState({
            strategy_ipacl: value
        })
    }
    _onFocus = (e) => {
        e.preventDefault()

        const form = this.props.form

        form.validateFields([e.target.id], { force: true })
    }
    _removeLocalNetwork = (k) => {
        let fieldsValue = {}
        const { form } = this.props
        // can use data-binding to get
        const localNetworks = form.getFieldValue('localNetworks')

        fieldsValue['local_network' + k] = ''
        fieldsValue.localNetworks = localNetworks.filter(item => item.key !== k)

        // can use data-binding to set
        form.setFieldsValue(fieldsValue)
    }
    render() {
        let localNetworkIds = []
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const settings = this.props.settings || {}
        const currentEditId = this.props.currentEditId
        const extension_type = this.props.extensionType
        const { getFieldDecorator, getFieldValue } = this.props.form
        const allow = (settings.allow ? settings.allow : 'ulaw,alaw,gsm,g726,g722,g729,h264,ilbc')

        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        const formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 8 }
        }

        const formItemLayoutTransfer = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 }
        }

        _.map(settings, function(value, key) {
            if ((key.indexOf('local_network') > -1) && (key !== 'local_network1') && value) {
                localNetworkIds.push({
                    key: parseInt(key.slice(13))
                })
            }
        })

        getFieldDecorator('allow', { initialValue: allow })
        getFieldDecorator('localNetworks', { initialValue: localNetworkIds })

        const localNetworks = getFieldValue('localNetworks')
        const localNetworkFormItems = localNetworks.map((item, index) => {
            return (
                <Col
                    key={ item.key }
                    span={ 12 }
                    className={ extension_type !== 'fxs' && this.state.strategy_ipacl === '1' ? 'display-block' : 'hidden' }
                >
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1145" /> }>
                                    <span>{ formatMessage({id: "LANG1146"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator(`local_network${item.key}`, {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: (extension_type !== 'fxs' && this.state.strategy_ipacl === '1'),
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (extension_type !== 'fxs' && this.state.strategy_ipacl === '1') ? this._checkNetwork : ''
                            }, {
                                validator: (extension_type !== 'fxs' && this.state.strategy_ipacl === '1') ? this._checkNetworkNumber : ''
                            }],
                            initialValue: item.new ? '' : settings[`local_network${item.key}`],
                            className: (extension_type !== 'fxs' && this.state.strategy_ipacl === '1' ? 'display-block' : 'hidden')
                        })(
                            <Input />
                        ) }
                        <Icon
                            type="minus-circle-o"
                            onClick={ () => this._removeLocalNetwork(item.key) }
                            className="dynamic-network-button"
                        />
                    </FormItem>
                </Col>
            )
        })

        const faxmode = (extension_type === 'fxs'
                ? <Select>
                        <Option value='no'>{ formatMessage({id: "LANG133"}) }</Option>
                        <Option value='detect'>{ formatMessage({id: "LANG1135"}) }</Option>
                        <Option value="gateway">{ formatMessage({id: "LANG3554"}) }</Option>
                    </Select>
                : <Select>
                        <Option value='no'>{ formatMessage({id: "LANG133"}) }</Option>
                        <Option value='detect'>{ formatMessage({id: "LANG1135"}) }</Option>
                    </Select>)

        return (
            <div className="content">
                <div className="ant-form">
                    <Row
                        className={ extension_type === 'sip' ? 'display-block' : 'hidden' }
                    >
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG626"}) }</span>
                            </div>
                        </Col>
                        <Row className="row-section-content">
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1093" /> }>
                                                <span>{ 'NAT' }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('nat', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.nat ? (settings.nat === 'yes') : true,
                                        className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1095" /> }>
                                                <span>{ formatMessage({id: "LANG1094"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('directmedia', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: extension_type === 'sip',
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.directmedia ? settings.directmedia : 'no',
                                        className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Select>
                                            <Option value='yes'>{ formatMessage({id: "LANG136"}) }</Option>
                                            <Option value='no'>{ formatMessage({id: "LANG137"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1098" /> }>
                                                <span>{ formatMessage({id: "LANG1097"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('dtmfmode', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: extension_type === 'sip',
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.dtmfmode ? settings.dtmfmode : 'rfc2833',
                                        className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Select>
                                            <Option value='rfc2833'>{ 'RFC2833' }</Option>
                                            <Option value='info'>{ formatMessage({id: "LANG1099"}) }</Option>
                                            <Option value='inband'>{ formatMessage({id: "LANG1100"}) }</Option>
                                            <Option value='auto'>{ formatMessage({id: "LANG138"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            {/* <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ 'TIP_USERS_33' }>
                                                <span>{ 'MWI from' }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('mwifrom', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.mwifrom
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col> */}
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG2769" /> }>
                                                <span>{ formatMessage({id: "LANG2768"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('tel_uri', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: extension_type === 'sip',
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.tel_uri ? settings.tel_uri : 'disabled',
                                        className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                    })(
                                        <Select>
                                            <Option value='disabled'>{ formatMessage({id: "LANG2770"}) }</Option>
                                            <Option value='user_phone'>{ formatMessage({id: "LANG2771"}) }</Option>
                                            <Option value='enabled'>{ formatMessage({id: "LANG2772"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                    </Row>
                    <Row
                        className={ extension_type === 'fxs' ? 'display-block' : 'hidden' }
                    >
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG628"}) }</span>
                            </div>
                        </Col>
                        <Row className="row-section-content">
                            {/* <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ 'TIP_USERS_9' }>
                                                <span>{ 'In Directory' }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('inDirectory', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.inDirectory === 'yes'
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col> */}
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1110" /> }>
                                                <span>{ formatMessage({id: "LANG1109"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('callwaiting', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.callwaiting ? (settings.callwaiting === 'yes') : false,
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1112" /> }>
                                                <span>{ formatMessage({id: "LANG1111"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('sharpissendkey', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.sharpissendkey ? (settings.sharpissendkey === 'yes') : true,
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1114" /> }>
                                                <span>{ formatMessage({id: "LANG1113"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('rxgain', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: extension_type === 'fxs',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                extension_type === 'fxs' ? Validator.gain(data, value, callback, formatMessage, -30, 6) : callback()
                                            }
                                        }],
                                        initialValue: settings.rxgain ? settings.rxgain + '' : '0',
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Input min={ -30 } max={ 6 } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1116" /> }>
                                                <span>{ formatMessage({id: "LANG1115"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('txgain', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: extension_type === 'fxs',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                extension_type === 'fxs' ? Validator.gain(data, value, callback, formatMessage, -30, 6) : callback()
                                            }
                                        }],
                                        initialValue: settings.txgain ? settings.txgain + '' : '0',
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Input min={ -30 } max={ 6 } />
                                    ) }
                                </FormItem>
                            </Col>
                            {/* <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ formatMessage({id: "LANG1118"}) }>
                                                <span>{ formatMessage({id: "LANG1117"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('flash', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.flash
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col> */}
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1118" /> }>
                                                <span>{ formatMessage({id: "LANG1117"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('rxflash_min', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: extension_type === 'fxs',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                extension_type === 'fxs' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                extension_type === 'fxs' ? Validator.range(data, value, callback, formatMessage, 30, 1000) : callback()
                                            }
                                        }],
                                        initialValue: settings.rxflash_min ? settings.rxflash_min + '' : '200',
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Input min={ 30 } max={ 1000 } />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1120" /> }>
                                                <span>{ formatMessage({id: "LANG1119"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('rxflash', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: extension_type === 'fxs',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                extension_type === 'fxs' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                extension_type === 'fxs' ? Validator.range(data, value, callback, formatMessage, 40, 2000) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                const thisLabel = formatMessage({id: "LANG1119"})
                                                const otherInputValue = form.getFieldValue('rxflash_min')
                                                const otherInputLabel = formatMessage({id: "LANG1117"})

                                                extension_type === 'fxs' ? Validator.bigger(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel) : callback()
                                            }
                                        }],
                                        initialValue: settings.rxflash ? settings.rxflash + '' : '1250',
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1122" /> }>
                                                <span>{ formatMessage({id: "LANG1121"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('answeronpolarityswitch', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.answeronpolarityswitch ? (settings.answeronpolarityswitch === 'yes') : true,
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col>
                            {/* <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ formatMessage({id: "LANG1124"}) }>
                                                <span>{ formatMessage({id: "LANG1123"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('cidsignalling', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.cidsignalling
                                    })(
                                        <Select>
                                            <Option value='bell'>{ formatMessage({id: "LANG1125"}) }</Option>
                                            <Option value='dtmf'>{ 'DTMF' }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col> */}
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1127" /> }>
                                                <span>{ formatMessage({id: "LANG1126"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('echocancel', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: extension_type === 'fxs',
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.echocancel ? settings.echocancel : 'yes',
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Select>
                                            <Option value='yes'>{ formatMessage({id: "LANG139"}) }</Option>
                                            <Option value='no'>{ formatMessage({id: "LANG140"}) }</Option>
                                            <Option value='32'>{ '32' }</Option>
                                            <Option value='64'>{ '64' }</Option>
                                            <Option value='128'>{ '128' }</Option>
                                            <Option value='256'>{ '256' }</Option>
                                            <Option value='512'>{ '512' }</Option>
                                            <Option value='1024'>{ '1024' }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1129" /> }>
                                                <span>{ formatMessage({id: "LANG1128"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('threewaycalling', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.threewaycalling ? (settings.threewaycalling === 'yes') : true,
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Checkbox />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG2688" /> }>
                                                <span>{ formatMessage({id: "LANG2687"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('sendcalleridafter', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: extension_type === 'fxs',
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.sendcalleridafter ? settings.sendcalleridafter + '' : '1',
                                        className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                    })(
                                        <Select>
                                            <Option value='1'>{ '1' }</Option>
                                            <Option value='2'>{ '2' }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                    </Row>
                    <Row
                        className={ extension_type === 'iax' ? 'display-block' : 'hidden' }
                    >
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG627"}) }</span>
                            </div>
                        </Col>
                        <Row className="row-section-content">
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1131" /> }>
                                                <span>{ formatMessage({id: "LANG1130"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('maxcallnumbers', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: (data, value, callback) => {
                                                extension_type === 'iax' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                extension_type === 'iax' ? Validator.range(data, value, callback, formatMessage, 1, 512) : callback()
                                            }
                                        }],
                                        initialValue: settings.maxcallnumbers,
                                        className: extension_type === 'iax' ? 'display-block' : 'hidden'
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            {/* <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ 'TIP_USERS_20' }>
                                                <span>{ 'Transport' }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('transport', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.transport
                                    })(
                                        <Select>
                                            <Option value='udp'>{ 'UDP Only' }</Option>
                                            <Option value='tcp'>{ 'TCP Only' }</Option>
                                            <Option value='tls'>{ 'TLS Only' }</Option>
                                            <Option value='udp,tcp,tls'>{ 'All - UDP Primary' }</Option>
                                            <Option value='tcp,udp,tls'>{ 'All - TCP Primary' }</Option>
                                            <Option value='tls,udp,tcp'>{ 'All - TLS Primary' }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col> */}
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG1133" /> }>
                                                <span>{ formatMessage({id: "LANG1132"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('requirecalltoken', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: extension_type === 'iax',
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.requirecalltoken ? settings.requirecalltoken : 'yes',
                                        className: extension_type === 'iax' ? 'display-block' : 'hidden'
                                    })(
                                        <Select>
                                            <Option value='yes'>{ formatMessage({id: "LANG136"}) }</Option>
                                            <Option value='no'>{ formatMessage({id: "LANG137"}) }</Option>
                                            <Option value='auto'>{ formatMessage({id: "LANG138"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                        </Row>
                    </Row>
                    <Row className="row-section-content">
                        <Col
                            span={ 12 }
                            className={ extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3249" /> }>
                                            <span>{ formatMessage({id: "LANG3248"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('alertinfo', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: extension_type === 'sip',
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: this.state.alertinfo,
                                    className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Select onChange={ this._onChangeAlertInfo }>
                                        <Option value='none'>{ formatMessage({id: "LANG133"}) }</Option>
                                        <Option value='ring1'>{ 'Ring 1' }</Option>
                                        <Option value='ring2'>{ 'Ring 2' }</Option>
                                        <Option value='ring3'>{ 'Ring 3' }</Option>
                                        <Option value='ring4'>{ 'Ring 4' }</Option>
                                        <Option value='ring5'>{ 'Ring 5' }</Option>
                                        <Option value='ring6'>{ 'Ring 6' }</Option>
                                        <Option value='ring7'>{ 'Ring 7' }</Option>
                                        <Option value='ring8'>{ 'Ring 8' }</Option>
                                        <Option value='ring9'>{ 'Ring 9' }</Option>
                                        <Option value='ring10'>{ 'Ring 10' }</Option>
                                        <Option value="Bellcore-dr1">{ 'Bellcore-dr1' }</Option>
                                        <Option value="Bellcore-dr2">{ 'Bellcore-dr2' }</Option>
                                        <Option value="Bellcore-dr3">{ 'Bellcore-dr3' }</Option>
                                        <Option value="Bellcore-dr4">{ 'Bellcore-dr4' }</Option>
                                        <Option value="Bellcore-dr5">{ 'Bellcore-dr5' }</Option>
                                        <Option value="custom">{ formatMessage({id: "LANG231"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ (extension_type === 'sip' && this.state.alertinfo === 'custom') ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3250" /> }>
                                            <span>{ formatMessage({id: "LANG3250"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('custom_alert_info', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: (extension_type === 'sip' && this.state.alertinfo === 'custom'),
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            extension_type === 'sip' ? Validator.alphanumeric(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: this.state.custom_alert_info,
                                    className: (extension_type === 'sip' && this.state.alertinfo === 'custom') ? 'display-block' : 'hidden'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4199" /> }>
                                            <span>{ formatMessage({id: "LANG3871"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('faxmode', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: this.state.faxmode
                                })(
                                    faxmode
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4224" /> }>
                                            <span>{ formatMessage({id: "LANG4225"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('t38_udptl', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.t38_udptl ? settings.t38_udptl === 'yes' : false,
                                    className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type === 'fxs' ? 'hidden' : 'display-block' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1134" /> }>
                                            <span>{ 'SRTP' }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('encryption', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: extension_type === 'fxs',
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: settings.encryption ? settings.encryption : 'no',
                                    className: extension_type === 'fxs' ? 'hidden' : 'display-block'
                                })(
                                    <Select>
                                        <Option value='no'>{ formatMessage({id: "LANG4377"}) }</Option>
                                        <Option value="yes">{ formatMessage({id: "LANG4375"}) }</Option>
                                        <Option value='support'>{ formatMessage({id: "LANG4376"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type === 'fxs' ? 'hidden' : 'display-block' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1138" /> }>
                                            <span>{ formatMessage({id: "LANG1137"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('strategy_ipacl', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: extension_type === 'fxs',
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: settings.strategy_ipacl ? settings.strategy_ipacl.toString() : '0',
                                    className: extension_type === 'fxs' ? 'hidden' : 'display-block'
                                })(
                                    <Select onChange={ this._onChangeStrategy }>
                                        <Option value='0'>{ formatMessage({id: "LANG1139"}) }</Option>
                                        <Option value="1">{ formatMessage({id: "LANG1140"}) }</Option>
                                        <Option value='2'>{ formatMessage({id: "LANG1141"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type !== 'fxs' && this.state.strategy_ipacl === '2' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2346" /> }>
                                            <span>{ formatMessage({id: "LANG1144"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('specific_ip', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: (extension_type !== 'fxs' && this.state.strategy_ipacl === '2'),
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            extension_type !== 'fxs' && this.state.strategy_ipacl === '2' ? Validator.ipDns(data, value, callback, formatMessage, 'ip') : callback()
                                        }
                                    }],
                                    initialValue: settings.specific_ip,
                                    className: (extension_type !== 'fxs' && this.state.strategy_ipacl === '2' ? 'display-block' : 'hidden')
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type !== 'fxs' && this.state.strategy_ipacl === '1' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1145" /> }>
                                            <span>{ formatMessage({id: "LANG1146"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('local_network1', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: (extension_type !== 'fxs' && this.state.strategy_ipacl === '1'),
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (extension_type !== 'fxs' && this.state.strategy_ipacl === '1') ? this._checkNetwork : ''
                                    }, {
                                        validator: (extension_type !== 'fxs' && this.state.strategy_ipacl === '1') ? this._checkNetworkNumber : ''
                                    }],
                                    initialValue: settings.local_network1,
                                    className: (extension_type !== 'fxs' && this.state.strategy_ipacl === '1' ? 'display-block' : 'hidden')
                                })(
                                    <Input />
                                ) }
                                <Icon
                                    type="plus-circle-o"
                                    onClick={ this._addLocalNetwork }
                                    className="dynamic-network-button"
                                />
                            </FormItem>
                        </Col>
                        { localNetworkFormItems }
                        <Col
                            span={ 24 }
                            className={ extension_type === 'fxs' ? 'hidden' : 'display-block' }
                        >
                            <FormItem
                                { ...formItemLayoutTransfer }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1150" /> }>
                                            <span>{ formatMessage({id: "LANG1149"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                <Transfer
                                    showSearch
                                    sorter={ true }
                                    render={ item => item.title }
                                    targetKeys={ this.state.targetKeys }
                                    dataSource={ this._filterCodecsSource() }
                                    onChange={ this._handleTransferChange }
                                    filterOption={ this._filterTransferOption }
                                    notFoundContent={ formatMessage({id: "LANG133"}) }
                                    onSelectChange={ this._handleTransferSelectChange }
                                    searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                    titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default injectIntl(Media)
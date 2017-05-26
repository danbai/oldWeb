'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl, formatMessage } from 'react-intl'
import { Form, Input, Button, message, Tooltip, Select, Upload, Icon, Modal, Table, Row, Col } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import _ from 'underscore'
import Validator from "../../api/validator"

const FormItem = Form.Item
const Option = Select.Option
class Security extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ip: "",
            number: 512,
            addFlag: false
        }
    }
    componentDidMount () {
    }
    _addLimit = (e) => {
        const form = this.props.form
        const {formatMessage} = this.props.intl
        const { setFieldsValue } = this.props.form
        const limitList = this.props.limitList || []
        const featureLimits = JSON.parse(localStorage.getItem('featureLimits'))
        const max = (featureLimits && featureLimits.iax_call_limit ? parseInt(featureLimits.iax_call_limit) : 30)
        if (limitList.length >= max) {
            const warningMessage = <span dangerouslySetInnerHTML=
                                        {{ __html: formatMessage({ id: "LANG809" }, {
                                                0: formatMessage({ id: "LANG1687" }),
                                                1: max
                                            })
                                        }}
                                    ></span>

            message.destroy()
            message.warning(warningMessage)
            return
        }

        let value = {}
        this.state.addFlag = true
        form.validateFields(["ip"], { force: true })
        form.validateFields(["number"], { force: true })
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err || err["ip"] === undefined && err["number"] === undefined) {
                value["callnumberlimits"] = form.getFieldValue("ip") + "=" + form.getFieldValue("number")
                limitList.push(value)
                this.props.setLimitList(limitList)
                this.state.addFlag = false
                setFieldsValue({
                    'ip': ''
                })
                setFieldsValue({
                    'number': 512
                })
                this.setState({
                    ip: "",
                    number: 512,
                    addFlag: false
                })
            }
        })
    }
    _deleteLimit = (e) => {
        const limitList = this.props.limitList || []
        this.props.setLimitList(_.without(limitList, e))
        this.setState({
            ip: "",
            number: 512
        })
    }
    _myRequired = (data, val, callback, formatMessage) => {
        if (this.state.addFlag && !val) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _isExist = (data, val, callback, formatMessage) => {
        let limitList = this.props.limitList
        const form = this.props.form
        if (!this.state.addFlag || !val) {
            callback()
            return
        }
        let value = form.getFieldValue("ip") + "=" + form.getFieldValue("number")

        _.map(limitList, function(key, index) {
            if (key["callnumberlimits"] === value) {
                callback(formatMessage({id: "LANG270"}, {0: formatMessage({id: "LANG1687"})}))
                return
            }
        })
         callback()
    }
    _myIporrange = (data, val, callback, formatMessage) => {
        let limitList = this.props.limitList
        if (!this.state.addFlag) {
            callback()
            return
        }
        var pieces = val ? val.split("/") : []
        var reg = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}$/i
        var reg2 = /^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?$/
        var reg3 = /^\[((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\](\:(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9]))?$/
        var res = true

        for (var j = 0; j < pieces.length; j++) {
            if (!(reg.test(pieces[j]) || reg2.test(pieces[j] && ((pieces[j].indexOf("[") > -1 && pieces[j].indexOf("]") > -1) || (!pieces[j].indexOf("[") > -1 && !pieces[j].indexOf("]") > -1))) || reg3.test(pieces[j]))) {
                 res = false
            }
        }

        if (res) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2194"}))
        }
    }
    render() {
        const {formatMessage} = this.props.intl
        const { getFieldDecorator } = this.props.form
        let IAXSecSettings = this.props.IAXSecSettings
        const limitList = this.props.limitList || []
        const addLimit = this._addLimit
        const deleteLimit = this._deleteLimit
        const ip = this.state.ip
        const number = this.state.number
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        const columns = [{
                key: 'callnumberlimits',
                dataIndex: 'callnumberlimits',
                title: formatMessage({id: "LANG1685"}),
                sorter: (a, b) => a.callnumberlimits - b.callnumberlimits
            }, { 
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-del"
                                onClick={ deleteLimit.bind(this, record) }>
                            </span>
                        </div>
                }
            }]
        return (
            <div className="content">
                <Form>
                    <Row>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1682" /> }>
                                    <span>{ formatMessage({id: "LANG1681"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('calltokenoptional', {
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.iporrange(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: IAXSecSettings.calltokenoptional
                            })(
                                <Input maxLength="60" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1684" /> }>
                                    <span>{ formatMessage({id: "LANG1683"}) }</span>
                                </Tooltip>
                              }>
                            { getFieldDecorator('maxcallnumbers', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 65535)
                                    }
                                }],
                                initialValue: IAXSecSettings.maxcallnumbers
                            })(
                                <Input maxLength="6" />
                            )}
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1686" /> }>
                                    <span>{ formatMessage({id: "LANG1685"}) }</span>
                                </Tooltip>
                              }>
                            { getFieldDecorator('maxcallnumbers_nonvalidated', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 0, 65535)
                                    }
                                }],
                                initialValue: IAXSecSettings.maxcallnumbers_nonvalidated
                            })(
                                <Input maxLength="6" />
                            )}
                        </FormItem>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG1687"}) }</span>
                        </div>
                        <div className="row-section-content">
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1682" /> }>
                                        <span>{ formatMessage({id: "LANG1689"}) }</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('ip', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this._myRequired(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this._myIporrange(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this._isExist(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: ip
                                    })(
                                        <Input/>
                                )}
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1683" /> }>
                                        <span>{ formatMessage({id: "LANG1683"}) }</span>
                                    </Tooltip>
                                )}>
                                { getFieldDecorator('number', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.addFlag,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.addFlag ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.addFlag ? Validator.maxlength(data, value, callback, formatMessage, 6) : callback()
                                        }
                                    }],
                                    initialValue: number
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                            <Col span={ 24 } style={{ 'padding': '10px 0' }}>
                                <Col
                                    span={ 6 }
                                    offset={ 6 }
                                >
                                    <Button
                                        icon="plus"
                                        type="primary"
                                        onClick={ addLimit }
                                    >
                                        { formatMessage({id: "LANG769"}) }
                                    </Button>
                                </Col>
                            </Col>
                            <Col span={ 24 } style={{ 'margin': '10px 0 0 0' }}>
                                <Table
                                    rowKey="key"
                                    columns={ columns }
                                    pagination={ false }
                                    showHeader={ false }
                                    dataSource={ limitList }
                                />
                            </Col>
                        </div>
                    </Row>
                </Form>
            </div>
        )
    }
}
export default injectIntl(Security)

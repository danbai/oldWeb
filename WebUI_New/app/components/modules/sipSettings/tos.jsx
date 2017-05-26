'use strict'

import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import Validator from "../../api/validator"
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select } from 'antd'
const FormItem = Form.Item
const Option = Select.Option
import _ from 'underscore'

class Tos extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const sipTosSettings = this.props.dataSource
        const form = this.props.form
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="content">
                <Form>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1817" /> }>
                                            <span>{ formatMessage({id: "LANG1818"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('tos_sip', {
                                    rules: [],
                                    initialValue: sipTosSettings.tos_sip
                                })(
                                    <Select style={{ width: 200 }}>
                                        <Option value='none'>{formatMessage({id: "LANG133"})}</Option>
                                        <Option value='ef'>EF</Option>
                                        <Option value='CS0'>CS0</Option>
                                        <Option value='CS1'>CS1</Option>
                                        <Option value='CS2'>CS2</Option>
                                        <Option value='CS3'>CS3</Option>
                                        <Option value='CS4'>CS4</Option>
                                        <Option value='CS5'>CS5</Option>
                                        <Option value='CS6'>CS6</Option>
                                        <Option value='CS7'>CS7</Option>
                                        <Option value='AF11'>AF11</Option>
                                        <Option value='AF12'>AF12</Option>
                                        <Option value='AF13'>AF13</Option>
                                        <Option value='AF21'>AF21</Option>
                                        <Option value='AF22'>AF22</Option>
                                        <Option value='AF23'>AF23</Option>
                                        <Option value='AF31'>AF31</Option>
                                        <Option value='AF32'>AF32</Option>
                                        <Option value='AF33'>AF33</Option>
                                        <Option value='AF41'>AF41</Option>
                                        <Option value='AF42'>AF42</Option>
                                        <Option value='AF43'>AF43</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1813" /> }>
                                            <span>{ formatMessage({id: "LANG1814"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('tos_audio', {
                                    rules: [],
                                    initialValue: sipTosSettings.tos_audio
                                })(
                                    <Select style={{ width: 200 }}>
                                        <Option value='none'>{formatMessage({id: "LANG133"})}</Option>
                                        <Option value='ef'>EF</Option>
                                        <Option value='CS0'>CS0</Option>
                                        <Option value='CS1'>CS1</Option>
                                        <Option value='CS2'>CS2</Option>
                                        <Option value='CS3'>CS3</Option>
                                        <Option value='CS4'>CS4</Option>
                                        <Option value='CS5'>CS5</Option>
                                        <Option value='CS6'>CS6</Option>
                                        <Option value='CS7'>CS7</Option>
                                        <Option value='AF11'>AF11</Option>
                                        <Option value='AF12'>AF12</Option>
                                        <Option value='AF13'>AF13</Option>
                                        <Option value='AF21'>AF21</Option>
                                        <Option value='AF22'>AF22</Option>
                                        <Option value='AF23'>AF23</Option>
                                        <Option value='AF31'>AF31</Option>
                                        <Option value='AF32'>AF32</Option>
                                        <Option value='AF33'>AF33</Option>
                                        <Option value='AF41'>AF41</Option>
                                        <Option value='AF42'>AF42</Option>
                                        <Option value='AF43'>AF43</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1815" /> }>
                                            <span>{ formatMessage({id: "LANG1816"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('tos_video', {
                                    rules: [],
                                    initialValue: sipTosSettings.tos_video
                                })(
                                    <Select style={{ width: 200 }}>
                                        <Option value='none'>{formatMessage({id: "LANG133"})}</Option>
                                        <Option value='ef'>EF</Option>
                                        <Option value='CS0'>CS0</Option>
                                        <Option value='CS1'>CS1</Option>
                                        <Option value='CS2'>CS2</Option>
                                        <Option value='CS3'>CS3</Option>
                                        <Option value='CS4'>CS4</Option>
                                        <Option value='CS5'>CS5</Option>
                                        <Option value='CS6'>CS6</Option>
                                        <Option value='CS7'>CS7</Option>
                                        <Option value='AF11'>AF11</Option>
                                        <Option value='AF12'>AF12</Option>
                                        <Option value='AF13'>AF13</Option>
                                        <Option value='AF21'>AF21</Option>
                                        <Option value='AF22'>AF22</Option>
                                        <Option value='AF23'>AF23</Option>
                                        <Option value='AF31'>AF31</Option>
                                        <Option value='AF32'>AF32</Option>
                                        <Option value='AF33'>AF33</Option>
                                        <Option value='AF41'>AF41</Option>
                                        <Option value='AF42'>AF42</Option>
                                        <Option value='AF43'>AF43</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1784" /> }>
                                            <span>{ formatMessage({id: "LANG1783"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('defaultexpiry', {
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: sipTosSettings.defaultexpiry
                                })(
                                    <Input maxLength="4" />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1792" /> }>
                                            <span>{ formatMessage({id: "LANG1791"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('maxexpiry', {
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let thisLabel = formatMessage({id: "LANG1791"})
                                            let otherInputValue = form.getFieldValue("defaultexpiry")
                                            let otherInputLabel = formatMessage({id: "LANG1783"})
                                            Validator.bigger(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel)
                                        }
                                    }],
                                    initialValue: sipTosSettings.maxexpiry
                                })(
                                    <Input maxLength="4" />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1794" /> }>
                                            <span>{ formatMessage({id: "LANG1793"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('minexpiry', {
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.min(data, value, callback, formatMessage, 90)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let thisLabel = formatMessage({id: "LANG1793"})
                                            let otherInputValue = form.getFieldValue("defaultexpiry")
                                            let otherInputLabel = formatMessage({id: "LANG1783"})
                                            Validator.smaller(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel)
                                        }
                                    }],
                                    initialValue: sipTosSettings.minexpiry
                                })(
                                    <Input maxLength="4" />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1788" /> }>
                                            <span>{ formatMessage({id: "LANG1787"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('relaxdtmf', {
                                    rules: [],
                                    valuePropName: "checked",
                                    initialValue: sipTosSettings.relaxdtmf
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1098" /> }>
                                            <span>{ formatMessage({id: "LANG1097"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('dtmfmode', {
                                    rules: [],
                                    initialValue: sipTosSettings.dtmfmode
                                })(
                                    <Select style={{ width: 200 }}>
                                        <Option value='rfc2833'>RFC2833</Option>
                                        <Option value='info'>{formatMessage({id: "LANG1099"})}</Option>
                                        <Option value='inband'>{formatMessage({id: "LANG1100"})}</Option>
                                        <Option value='auto'>{formatMessage({id: "LANG138"})}</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1804" /> }>
                                            <span>{ formatMessage({id: "LANG1803"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('rtptimeout', {
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let thisLabel = formatMessage({id: "LANG1803"})
                                            let otherInputValue = form.getFieldValue("rtpholdtimeout")
                                            let otherInputLabel = formatMessage({id: "LANG1801"})
                                            Validator.smaller(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let otherInputValue = form.getFieldValue("rtpholdtimeout")
                                            let otherInputLabel = formatMessage({id: "LANG1801"})
                                            Validator.notEqualTo(data, value, callback, formatMessage, otherInputValue ? otherInputValue.toString() : "", otherInputLabel)
                                        }
                                    }],
                                    initialValue: sipTosSettings.rtptimeout
                                })(
                                    <Input maxLength="4" />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1802" /> }>
                                            <span>{ formatMessage({id: "LANG1801"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('rtpholdtimeout', {
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let thisLabel = formatMessage({id: "LANG1801"})
                                            let otherInputValue = form.getFieldValue("rtptimeout")
                                            let otherInputLabel = formatMessage({id: "LANG1803"})
                                            Validator.bigger(data, value, callback, formatMessage, thisLabel, otherInputValue, otherInputLabel)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let otherInputValue = form.getFieldValue("rtptimeout")
                                            let otherInputLabel = formatMessage({id: "LANG1803"})
                                            Validator.notEqualTo(data, value, callback, formatMessage, otherInputValue ? otherInputValue.toString() : "", otherInputLabel)
                                        }
                                    }],
                                    initialValue: sipTosSettings.rtpholdtimeout
                                })(
                                    <Input maxLength="4" />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5265" /> }>
                                            <span>{ formatMessage({id: "LANG5264"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('rtpkeepalive', {
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.range(data, value, callback, formatMessage, 0, 3600)
                                        }
                                    }],
                                    initialValue: sipTosSettings.rtpkeepalive
                                })(
                                    <Input maxLength="4" />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4216" /> }>
                                            <span>{ formatMessage({id: "LANG4215"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('p100rel', {
                                    rules: [],
                                    initialValue: sipTosSettings.p100rel || 'no'
                                })(
                                    <Select style={{ width: 200 }}>
                                        <Option value='no'>{ formatMessage({id: "LANG137"}) }</Option>
                                        <Option value='yes'>{ formatMessage({id: "LANG136"}) }</Option>
                                        <Option value='required'>{ formatMessage({id: "LANG4214"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1819" /> }>
                                            <span>{ formatMessage({id: "LANG1820"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('trustrpid', {
                                    rules: [],
                                    valuePropName: "checked",
                                    initialValue: sipTosSettings.trustrpid
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1808" /> }>
                                            <span>{ formatMessage({id: "LANG1807"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('sendrpid', {
                                    rules: [],
                                    valuePropName: "checked",
                                    initialValue: sipTosSettings.sendrpid
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1790" /> }>
                                            <span>{ formatMessage({id: "LANG1789"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('progressinband', {
                                    rules: [],
                                    initialValue: sipTosSettings.progressinband || "never"
                                })(
                                    <Select style={{ width: 200 }}>
                                        <Option value='never'>{ formatMessage({id: "LANG546"}) }</Option>
                                        <Option value='no'>{ formatMessage({id: "LANG137"}) }</Option>
                                        <Option value='yes'>{ formatMessage({id: "LANG136"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1810" /> }>
                                            <span>{ formatMessage({id: "LANG1809"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('useragent', {
                                    rules: [],
                                    initialValue: sipTosSettings.useragent
                                })(
                                    <Input maxLength="120" />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1806" /> }>
                                            <span>{ formatMessage({id: "LANG1805"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('compactheaders', {
                                    rules: [],
                                    valuePropName: "checked",
                                    initialValue: sipTosSettings.compactheaders
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}

export default injectIntl(Tos)

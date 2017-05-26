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
import { Button, Checkbox, Col, Form, Input, Icon, message, Radio, Row, Select, Table, TimePicker, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const CheckboxGroup = Checkbox.Group

class FailoverTrunk extends Component {
    constructor(props) {
        super(props)

        let { formatMessage } = this.props.intl

        this.state = {
            currentMode: '',
            currentFailoverTrunk: {},
            failoverTrunk: this.props.failoverTrunk
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    _add = () => {
        this.setState({
            currentMode: 'add'
        })
    }
    _cancel = () => {
        const form = this.props.form

        form.resetFields(['failover_trunk_index', 'failover_strip', 'failover_prepend'])

        this.setState({
            currentMode: '',
            currentFailoverTrunk: {}
        })
    }
    _edit = (index) => {
        let { form } = this.props
        let failoverTrunk = _.clone(this.state.failoverTrunk)

        failoverTrunk = _.filter(failoverTrunk, (data) => { return data.failover_trunk_sequence === index })

        failoverTrunk = failoverTrunk[0]

        form.setFieldsValue({
            'failover_strip': failoverTrunk.failover_strip,
            'failover_prepend': failoverTrunk.failover_prepend,
            'failover_trunk_index': failoverTrunk.failover_trunk_index + ''
        })

        this.setState({
            currentMode: 'edit',
            currentFailoverTrunk: failoverTrunk
        })
    }
    _delete = (index) => {
        let failoverTrunk = _.clone(this.state.failoverTrunk)

        failoverTrunk = _.filter(failoverTrunk, (data) => { return data.failover_trunk_sequence !== index })

        this._setAllDataSequence(failoverTrunk)
    }
    _save = () => {
        // e.preventDefault()

        const form = this.props.form
        const { formatMessage } = this.props.intl

        let featureLimits = JSON.parse(localStorage.getItem('featureLimits'))
        let maxFailoverTrunk = featureLimits.failover ? featureLimits.failover : 10

        if (this.state.currentMode === 'add' && this.state.failoverTrunk.length >= maxFailoverTrunk) {
            message.destroy()
            message.warning(formatMessage({id: "LANG5351"}, {0: maxFailoverTrunk, 1: maxFailoverTrunk}))

            return false
        } else {
            const fields = ['failover_trunk_index', 'failover_strip', 'failover_prepend']

            form.validateFieldsAndScroll(fields, { force: true }, (err, values) => {
                if (!err) {
                    let failoverTrunk = _.clone(this.state.failoverTrunk),
                        obj = {
                            failover_trunk_index: values.failover_trunk_index,
                            failover_strip: values.failover_strip ? values.failover_strip : '0',
                            failover_prepend: values.failover_prepend ? values.failover_prepend : ''
                        }

                    if (this.state.currentMode === 'edit') {
                        failoverTrunk = _.map(failoverTrunk, (data) => {
                            if (data.failover_trunk_sequence === this.state.currentFailoverTrunk.failover_trunk_sequence) {
                                obj.failover_trunk_sequence = data.failover_trunk_sequence

                                return obj
                            } else {
                                return data
                            }
                        })
                    } else {
                        obj.failover_trunk_sequence = this._getFTIndex()

                        failoverTrunk.push(obj)
                    }

                    this.setState({
                        currentMode: '',
                        currentFailoverTrunk: {},
                        failoverTrunk: failoverTrunk
                    })

                    form.setFieldsValue({
                        failover_outbound_data: failoverTrunk
                    })

                    form.resetFields(fields)
                }
            })
        }
    }
    _setAllDataSequence = (failover) => {
        let { form } = this.props
        let failoverTrunk = _.map(failover, (data, index) => {
                let obj = data

                obj.failover_trunk_sequence = index + 1

                return obj
            })

        form.setFieldsValue({
            failover_outbound_data: failoverTrunk
        })

        this.setState({
            failoverTrunk: failoverTrunk
        })
    }
    _top = (index) => {
        if (index === 1) {
            return false
        }

        let sequence = index - 1,
            failoverTrunk = _.clone(this.state.failoverTrunk)

        let currentFailoverTrunk = failoverTrunk[sequence]

        failoverTrunk.splice(sequence, 1)
        failoverTrunk.splice(0, 0, currentFailoverTrunk)

        this._setAllDataSequence(failoverTrunk)
    }
    _up = (index) => {
        if (index === 1) {
            return false
        }

        let sequence = index - 1,
            failoverTrunk = _.clone(this.state.failoverTrunk)

        let currentFailoverTrunk = failoverTrunk[sequence]

        failoverTrunk[sequence] = failoverTrunk[sequence - 1]
        failoverTrunk[sequence - 1] = currentFailoverTrunk

        this._setAllDataSequence(failoverTrunk)
    }
    _down = (index) => {
        if (index === this.state.failoverTrunk.length) {
            return false
        }

        let sequence = index - 1,
            failoverTrunk = _.clone(this.state.failoverTrunk)

        let currentFailoverTrunk = failoverTrunk[sequence]

        failoverTrunk[sequence] = failoverTrunk[index]
        failoverTrunk[index] = currentFailoverTrunk

        this._setAllDataSequence(failoverTrunk)
    }
    _bottom = (index) => {
        if (index === this.state.failoverTrunk.length) {
            return false
        }

        let sequence = index - 1,
            failoverTrunk = _.clone(this.state.failoverTrunk),
            length = failoverTrunk.length - 1

        let currentFailoverTrunk = failoverTrunk[sequence]

        failoverTrunk.splice(sequence, 1)
        failoverTrunk.splice(length, 0, currentFailoverTrunk)

        this._setAllDataSequence(failoverTrunk)
    }
    _getFTIndex = () => {
        let j,
            i = 1,
            length = 1000000,
            failoverTrunk = this.state.failoverTrunk

        for (i; i < length; i++) {
            let exist = false

            for (j = 0; j < failoverTrunk.length; j++) {
                if (i === failoverTrunk[j]['failover_trunk_sequence']) {
                    exist = true
                    break
                }
            }

            if (!exist) {
                break
            }
        }

        return i
    }
    _getTrunkName = (datasource, trunkIndex) => {
        const { formatMessage } = this.props.intl

        let trunkName

        _.map(datasource, function(data, index) {
            if (data.trunk_index === parseInt(trunkIndex)) {
                if (data.technology === 'Analog') {
                    trunkName = <span
                                    className={ data.out_of_service === 'yes' ? 'out-of-service' : '' }
                                >
                                    {
                                        formatMessage({id: 'LANG105'}) + ' ' + formatMessage({id: 'LANG83'}) + ' -- ' + data.trunk_name +
                                        (data.out_of_service === 'yes' ? ' -- ' + formatMessage({id: 'LANG273'}) : '')
                                    }
                                </span>
                } else {
                    trunkName = <span
                                    className={ data.out_of_service === 'yes' ? 'out-of-service' : '' }
                                >
                                    {
                                        data.technology + ' ' + formatMessage({id: 'LANG83'}) + ' -- ' + data.trunk_name +
                                        (data.out_of_service === 'yes' ? ' -- ' + formatMessage({id: 'LANG273'}) : '')
                                    }
                                </span>
                }
            }
        })

        return trunkName
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemSpecialLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 }
        }

        const columns = [{
                key: 'failover_trunk_index',
                dataIndex: 'failover_trunk_index',
                title: formatMessage({id: "LANG83"}),
                render: (text, record, index) => {
                    return this._getTrunkName(this.props.trunkList, record.failover_trunk_index)
                }
            }, {
                key: 'failover_strip',
                dataIndex: 'failover_strip',
                title: formatMessage({id: "LANG1547"}),
                render: (text, record, index) => {
                    return record.failover_strip || '0'
                }
            }, {
                key: 'failover_prepend',
                dataIndex: 'failover_prepend',
                title: formatMessage({id: "LANG1541"}),
                render: (text, record, index) => {
                    return record.failover_prepend || ''
                }
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    if (this.state.currentMode) {
                        return <div>
                                    <span className="sprite sprite-top-disabled"></span>
                                    <span className="sprite sprite-up-disabled"></span>
                                    <span className="sprite sprite-down-disabled"></span>
                                    <span className="sprite sprite-bottom-disabled"></span>
                                    <span className="sprite sprite-edit-disabled"></span>
                                    <span className="sprite sprite-del-disabled"></span>
                                </div>
                    } else {
                        return <div>
                                <span
                                    className={ record.failover_trunk_sequence === 1 ? "sprite sprite-top-disabled" : "sprite sprite-top" }
                                    onClick={ this._top.bind(this, record.failover_trunk_sequence) }
                                >
                                </span>
                                <span
                                    className={ record.failover_trunk_sequence === 1 ? "sprite sprite-up-disabled" : "sprite sprite-up" }
                                    onClick={ this._up.bind(this, record.failover_trunk_sequence) }
                                >
                                </span>
                                <span
                                    className={ record.failover_trunk_sequence === this.state.failoverTrunk.length ? "sprite sprite-down-disabled" : "sprite sprite-down" }
                                    onClick={ this._down.bind(this, record.failover_trunk_sequence) }
                                >
                                </span>
                                <span
                                    className={ record.failover_trunk_sequence === this.state.failoverTrunk.length ? "sprite sprite-bottom-disabled" : "sprite sprite-bottom" }
                                    onClick={ this._bottom.bind(this, record.failover_trunk_sequence) }
                                >
                                </span>
                                <span
                                    className="sprite sprite-edit"
                                    onClick={ this._edit.bind(this, record.failover_trunk_sequence) }
                                >
                                </span>
                                <span
                                    className="sprite sprite-del"
                                    onClick={ this._delete.bind(this, record.failover_trunk_sequence) }>
                                </span>
                            </div>
                    }
                }
            }]

        getFieldDecorator('failover_outbound_data', { initialValue: this.state.failoverTrunk })

        return (
            <div className="specific-time">
                <Row className={ this.state.currentMode ? 'display-block' : 'hidden' }>
                    <Col span={ 24 }>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1550" /> }>
                                        <span>{ formatMessage({id: "LANG1536"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('failover_trunk_index', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }]
                            })(
                                this.props.renderTrunkOptions(true)
                            ) }
                        </FormItem>
                    </Col>
                    <Col span={ 24 }>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1548" /> }>
                                        <span>{ formatMessage({id: "LANG245"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('failover_strip', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 2)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        let pattern = form.getFieldValue('match')
                                        let prepend = form.getFieldValue('failover_prepend')

                                        Validator.stripMax(data, value, callback, formatMessage, formatMessage({id: "LANG5634"}).toLowerCase(), pattern, prepend)
                                    }
                                }]
                            })(
                                <Input />
                            ) }
                        </FormItem>
                    </Col>
                    <Col span={ 24 }>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1542" /> }>
                                        <span>{ formatMessage({id: "LANG1541"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('failover_prepend', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.phoneNumberOrExtension(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 20)
                                    }
                                }]
                            })(
                                <Input />
                            ) }
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={ 24 }>
                        <Button
                            icon="plus"
                            type="primary"
                            onClick={ this._add }
                            className={ !this.state.currentMode ? 'display-inline' : 'hidden' }
                        >
                            { formatMessage({id: "LANG769"}) }
                        </Button>
                        <Button
                            icon="check"
                            type="primary"
                            onClick={ this._save }
                            className={ this.state.currentMode ? 'display-inline' : 'hidden' }
                        >
                            { formatMessage({id: "LANG728"}) }
                        </Button>
                        <Button
                            icon="cross"
                            type="primary"
                            onClick={ this._cancel }
                            className={ this.state.currentMode ? 'display-inline' : 'hidden' }
                        >
                            { formatMessage({id: "LANG726"}) }
                        </Button>
                    </Col>
                    <Col span={ 24 } style={{ 'margin': '20px 0 0 0' }}>
                        <Table
                            columns={ columns }
                            pagination={ false }
                            rowKey="failover_trunk_sequence"
                            dataSource={ this.state.failoverTrunk }
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default injectIntl(FailoverTrunk)
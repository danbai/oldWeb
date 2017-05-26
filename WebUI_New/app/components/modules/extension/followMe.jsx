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
import { Button, Checkbox, Col, Form, Input, Icon, message, Radio, Row, Select, Table, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

class FollowMe extends Component {
    constructor(props) {
        super(props)

        this.state = {
            followmeItem: {},
            followmeMembers: [],
            memberAccountList: [],
            fm_destination_value: '',
            fm_member_type: 'local',
            fm_enable_destination: false,
            fm_destination_type: 'account'
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _addMembers = () => {
        // e.preventDefault()

        const form = this.props.form
        const { formatMessage } = this.props.intl
        const fields = ['fm_member_type', 'fm_member_local', 'fm_member_external', 'fm_member_ringtime', 'fm_member_order']

        form.validateFieldsAndScroll(fields, { force: true }, (err, values) => {
            if (!err) {
                let followmeMembers = _.clone(this.state.followmeMembers)

                if (values.fm_member_order === 'after') {
                    let obj = {
                            key: followmeMembers.length,
                            ringtime: values.fm_member_ringtime
                        }

                    if (values.fm_member_type === 'local') {
                        obj.extension = [values.fm_member_local]
                    } else {
                        obj.extension = [values.fm_member_external]
                    }

                    followmeMembers.push(obj)
                } else {
                    let obj = followmeMembers[followmeMembers.length - 1]

                    obj.ringtime = values.fm_member_ringtime

                    if (values.fm_member_type === 'local') {
                        obj.extension.push(values.fm_member_local)
                    } else {
                        obj.extension.push(values.fm_member_external)
                    }

                    followmeMembers[followmeMembers.length - 1] = obj
                }

                this.setState({
                    fm_member_type: 'local',
                    followmeMembers: followmeMembers
                })

                form.setFieldsValue({
                    fm_members: followmeMembers
                })

                form.resetFields(fields)
            }
        })
    }
    _createExtension = (text, record, index) => {
        let extension
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form

        extension = <div style={{ 'paddingLeft': '10px', 'textAlign': 'left' }}>
                    <span>{ record.extension.join(' & ') }</span>
                    <span style={{ 'padding': '0 5px' }}>{ formatMessage({id: "LANG569"}) }</span>
                    <span style={{ 'padding': '0 5px' }}>{ record.ringtime }</span>
                    {/* getFieldDecorator(`fm_member_ringtime_${record.key}`, {
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
                                Validator.range(data, value, callback, formatMessage, 10, 60)
                            }
                        }],
                        initialValue: record.ringtime
                    })(
                        <Input style={{ 'width': '50px' }} onChange={ this._onChangeRingtime.bind(this, record.key) } />
                    ) */}
                    <span style={{ 'padding': '0 5px' }}>{ formatMessage({id: "LANG570"}) }</span>
                </div>

        return extension
    }
    _checkMemberConflict = (data, val, callback) => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let error = false
        let order = form.getFieldValue('fm_member_order')

        if (val && order === 'alongWith') {
            let lastMember = _.last(this.state.followmeMembers)

            if (_.indexOf(lastMember.extension, val) !== -1) {
                error = true
            }
        }

        if (error) {
            callback(formatMessage({id: "LANG2207"}))
        } else {
            callback()
        }
    }
    _createOption = (text, record, index) => {
        const { formatMessage } = this.props.intl

        return <div>
                <span
                    className="sprite sprite-fast-del"
                    onClick={ this._delete.bind(this, record.key) }>
                </span>
            </div>
    }
    _delete = (key) => {
        let { form } = this.props
        let followmeMembers = _.clone(this.state.followmeMembers)

        followmeMembers = _.filter(followmeMembers, (data) => { return data.key !== key })

        this.setState({
                followmeMembers: followmeMembers
            }, () => {
                form.setFieldsValue({
                    fm_members: followmeMembers
                })

                if (!followmeMembers.length) {
                    form.setFieldsValue({
                        fm_member_order: 'after'
                    })
                }
            })
    }
    _getInitData = () => {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const currentEditId = this.props.currentEditId

        let followmeItem = {}
        let followmeMembers = []
        let fm_destination_value = ''
        let fm_enable_destination = false
        let fm_destination_type = 'account'
        let extenion = form.getFieldValue('extension')
        let destinationDataSource = this.props.destinationDataSource
        let memberAccountList = _.filter(destinationDataSource.account, (data) => { return data.value !== extenion })

        if (currentEditId) {
            $.ajax({
                async: false,
                type: 'post',
                url: api.apiHost,
                data: {
                    action: 'getFollowme',
                    followme: currentEditId
                },
                success: function(res) {
                    // const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    // if (bool) {
                    if (res.status === 0) {
                        const response = res.response || {}
                        const followme = res.response.followme || {}
                        const members = followme.members

                        _.map(followme, (value, key) => {
                            if (value) {
                                followmeItem['fm_' + key] = value
                            } else {
                                followmeItem['fm_' + key] = ''
                            }
                        })

                        _.map(members, (data, key) => {
                            let extension = data.extension ? data.extension.split(',') : []

                            followmeMembers.push({
                                key: key,
                                extension: extension,
                                ringtime: data.ringtime
                            })
                        })

                        fm_destination_type = followme.destination_type
                        fm_enable_destination = followme.enable_destination === 'yes'

                        if (fm_destination_type === 'voicemail') {
                            fm_destination_value = followme['vm_extension']
                        } else if (fm_destination_type === 'queue') {
                            fm_destination_value = followme['queue_dest']
                        } else {
                            fm_destination_value = followme[fm_destination_type]
                        }

                        form.setFieldsValue({
                            fm_action: 'updateFollowme'
                        })
                    } else {
                        form.setFieldsValue({
                            fm_action: 'addFollowme'
                        })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        } else {
            form.setFieldsValue({
                fm_action: 'addFollowme'
            })
        }

        this.setState({
            followmeItem: followmeItem,
            followmeMembers: followmeMembers,
            memberAccountList: memberAccountList,
            fm_destination_value: fm_destination_value,
            fm_enable_destination: fm_enable_destination,
            fm_destination_type: fm_destination_type.replace(/_t/g, '')
        })
    }
    _onChangeDesType = (value) => {
        let form = this.props.form
        let destinationList = this.props.destinationDataSource[value]

        this.setState({
                fm_destination_type: value,
                fm_destination_value: destinationList.length ? destinationList[0].value : ''
            }, () => {
                form.setFieldsValue({
                    fm_external_number: '',
                    fm_destination_value: destinationList.length ? destinationList[0].value : ""
                })
            })
    }
    _onChangeEnableDes = (e) => {
        this.setState({
            fm_enable_destination: e.target.checked
        })
    }
    _onChangeMemberType = (e) => {
        this.setState({
            fm_member_type: e.target.value
        })
    }
    _onChangeRingtime = (key, event) => {
        let followmeMembers = _.clone(this.state.followmeMembers)

        followmeMembers[key].ringtime = event.target.value

        this.setState({
            followmeMembers: followmeMembers
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form

        const settings = this.state.followmeItem || {}

        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        const formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        }

        const radioStyle = {
            height: "30px",
            display: "block",
            lineHeight: "30px"
        }

        const orderRadio = this.state.followmeMembers.length
                            ? <RadioGroup>
                                    <Radio value="after">{ formatMessage({id: "LANG1983"}) }</Radio>
                                    <Radio value="alongWith">{ formatMessage({id: "LANG1984"}) }</Radio>
                                </RadioGroup>
                            : <RadioGroup>
                                    <Radio value="after">{ formatMessage({id: "LANG1983"}) }</Radio>
                                </RadioGroup>

        const columns = [{
                key: 'key',
                dataIndex: 'key',
                title: formatMessage({id: "LANG85"}),
                render: (text, record, index) => (
                    this._createExtension(text, record, index)
                )
            }, { 
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => (
                    this._createOption(text, record, index)
                )
            }]

        getFieldDecorator('fm_action', { initialValue: '' })
        getFieldDecorator('fm_members', { initialValue: this.state.followmeMembers })

        return (
            <div className="content">
                <div className="ant-form">
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1980" /> }>
                                            <span>{ formatMessage({id: "LANG274"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('fm_enable_followme', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.fm_enable_followme === 'yes'
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4043" /> }>
                                            <span>{ formatMessage({id: "LANG1142"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('fm_bypass_outrt_auth', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.fm_bypass_outrt_auth === 'yes'
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1977" /> }>
                                            <span>{ formatMessage({id: "LANG1976"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('fm_musicclass', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [],
                                    initialValue: settings.fm_musicclass ? settings.fm_musicclass : 'default'
                                })(
                                    <Select>
                                        {
                                            this.props.mohNameList.map(function(value) {
                                                return <Option
                                                            key={ value }
                                                            value={ value }
                                                        >
                                                            { value }
                                                        </Option>
                                            })
                                        }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4092" /> }>
                                            <span>{ formatMessage({id: "LANG4091"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('fm_enable_option', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.fm_enable_option === 'yes'
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2990" /> }>
                                            <span>{ formatMessage({id: "LANG2990"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('fm_enable_destination', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.fm_enable_destination
                                })(
                                    <Checkbox onChange={ this._onChangeEnableDes } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 24 }>
                            <Col span={ 12 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG4276" /> }>
                                                <span>{ formatMessage({id: "LANG1558"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('fm_destination_type', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.fm_enable_destination,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: this.state.fm_destination_type
                                    })(
                                        <Select
                                            onChange={ this._onChangeDesType }
                                            disabled={ !this.state.fm_enable_destination }
                                        >
                                            <Option value='account'>{ formatMessage({id: "LANG85"}) }</Option>
                                            <Option value='voicemail'>{ formatMessage({id: "LANG90"}) }</Option>
                                            <Option value='queue'>{ formatMessage({id: "LANG91"}) }</Option>
                                            <Option value='ringgroup'>{ formatMessage({id: "LANG600"}) }</Option>
                                            <Option value='vmgroup'>{ formatMessage({id: "LANG89"}) }</Option>
                                            <Option value='ivr'>{ formatMessage({id: "LANG19"}) }</Option>
                                            <Option value='external_number'>{ formatMessage({id: "LANG3458"}) }</Option>
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 6 }
                                className={ this.state.fm_destination_type !== 'external_number' ? 'display-block' : 'hidden' }
                            >
                                <FormItem>
                                    { getFieldDecorator('fm_destination_value', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.fm_enable_destination && this.state.fm_destination_type !== 'external_number',
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: this.state.fm_destination_value
                                    })(
                                        <Select disabled={ !this.state.fm_enable_destination }>
                                            {
                                                this.props.destinationDataSource[this.state.fm_destination_type].map(function(obj) {
                                                        return <Option
                                                                    key={ obj.key }
                                                                    value={ obj.value }
                                                                    className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                                    { obj.label }
                                                                </Option>
                                                    })
                                            }
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 6 }
                                className={ this.state.fm_destination_type === 'external_number' ? 'display-block' : 'hidden' }
                            >
                                <FormItem>
                                    { getFieldDecorator('fm_external_number', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.fm_enable_destination && this.state.fm_destination_type === 'external_number',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                (this.state.fm_enable_destination && this.state.fm_destination_type === 'external_number') ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage) : callback()
                                            }
                                        }],
                                        initialValue: settings.fm_external_number
                                    })(
                                        <Input disabled={ !this.state.fm_enable_destination } />
                                    ) }
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG711"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="row-section-content">
                        <Col
                            span={ 24 }
                        >
                            <FormItem
                                { ...formItemLayoutRow }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1979" /> }>
                                            <span>{ formatMessage({id: "LANG1978"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('fm_member_type', {
                                    initialValue: 'local'
                                })(
                                    <RadioGroup onChange={ this._onChangeMemberType }>
                                        <Radio value="local">{ formatMessage({id: "LANG1981"}) }</Radio>
                                        <Radio value="external">{ formatMessage({id: "LANG1982"}) }</Radio>
                                    </RadioGroup>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 24 }
                        >
                            <Col
                                span={ 4 }
                                offset={ 4 }
                                className={ this.state.fm_member_type === 'local' ? 'display-block' : 'hidden' }
                            >
                                <FormItem>
                                    { getFieldDecorator('fm_member_local', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.fm_member_type === 'local',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.fm_member_type === 'local' ? this._checkMemberConflict(data, value, callback) : callback()
                                            }
                                        }],
                                        initialValue: ''
                                    })(
                                        <Select>
                                            {
                                                this.state.memberAccountList.map(function(obj) {
                                                        return <Option
                                                                    key={ obj.key }
                                                                    value={ obj.value }
                                                                    className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                                    { obj.label }
                                                                </Option>
                                                    })
                                            }
                                        </Select>
                                    ) }
                                </FormItem>
                            </Col>
                            <Col
                                span={ 4 }
                                offset={ 4 }
                                className={ this.state.fm_member_type === 'external' ? 'display-block' : 'hidden' }
                            >
                                <FormItem>
                                    { getFieldDecorator('fm_member_external', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: this.state.fm_member_type === 'external',
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.fm_member_type === 'external' ? Validator.phoneNumberOrExtension(data, value, callback, formatMessage) : callback()
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                this.state.fm_member_type === 'external' ? this._checkMemberConflict(data, value, callback) : callback()
                                            }
                                        }],
                                        initialValue: ''
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            <FormItem style={{ float: 'left', display: 'inline-block' }}>
                                <span style={{ 'padding': '0 10px' }}>{ formatMessage({id: "LANG569"}) }</span>
                            </FormItem>
                            <Col span={ 3 }>
                                <FormItem>
                                    { getFieldDecorator('fm_member_ringtime', {
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
                                                Validator.range(data, value, callback, formatMessage, 10, 60)
                                            }
                                        }],
                                        initialValue: '30'
                                    })(
                                        <Input />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 1 }>
                                <FormItem>
                                    <span style={{ 'padding': '0 5px' }}>{ formatMessage({id: "LANG570"}) }</span>
                                </FormItem>
                            </Col>
                        </Col>
                        <Col
                            span={ 24 }
                        >
                            <FormItem
                                { ...formItemLayoutRow }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1975" /> }>
                                            <span>{ formatMessage({id: "LANG1974"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('fm_member_order', {
                                    initialValue: 'after'
                                })(
                                    orderRadio
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 24 } style={{ 'padding': '10px 0' }}>
                            <Col
                                span={ 4 }
                                offset={ 4 }
                            >
                                <Button
                                    icon="plus"
                                    type="primary"
                                    onClick={ this._addMembers }
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
                                dataSource={ this.state.followmeMembers }
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default injectIntl(FollowMe)
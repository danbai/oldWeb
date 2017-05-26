'use strict'

import $ from 'jquery'
import _ from 'underscore'
import moment from "moment"
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, DatePicker, TimePicker, Button, Modal, Row } from 'antd'

const FormItem = Form.Item
const confirm = Modal.confirm

class Cleaner extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {},
            log: ""
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {

    }
    _handleFormChange = (changedFields) => {
        _.extend(this.props.dataSource, changedFields)
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "GET",
            url: "/cgi?action=getCleanerValue",
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, formatMessage)

                let data = {}

                if (bool) {
                    const response = res.response || {}

                     _.each(response, function(num, key) {
                        if (key === 'Phour_clean_cdr' || key === 'Pclean_cdr_interval' || key === 'Pclean_record_threshold' || key === 'Phour_clean_vr' || key === 'Pclean_record_interval') {
                            data[key] = num
                        } else {
                            data[key] = num === "1" ? true : false
                        }
                    })

                    this.setState({
                        data: data
                    })
                }
            }.bind(this)
        })
        this._readLog()
    }
    _readLog = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        $.ajax({
            type: "GET",
            url: "/html/userdefined/cleaner_results?_=" + Math.random().toString(),
            dataType: "text",
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status !== 404) {
                    message.error(formatMessage({ id: "LANG909"}))
                }
            },
            success: function(data) {
                let arr = data.split("\n").reverse()
                if (arr.length > 1 && arr[1] === "</html>") {
                    arr = []
                }
                this.setState({
                    log: arr
                })
            }.bind(this)
        })
    }
    _doCleanLog = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        $.ajax({
            type: "GET",
            url: api.apiHost + "action=reloadCleanerLog&cleanerlog=",
            dataType: "json",
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    message.success(formatMessage({ id: "LANG3903"}))

                    this._readLog()
                }
            }.bind(this)
        })
    }
    _cleanLog = () => {
        const { formatMessage } = this.props.intl

        Modal.confirm({
                content: formatMessage({id: "LANG3902"}),
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"}),
                onOk: this._doCleanLog.bind(this)
            })
    }
    _onChangeCDR = (e) => {
        let data = this.state.data

        data.Pen_auto_clean_cdr = e.target.checked

        this.setState({
            data: data
        })
    }
     _onChangeFile = (e) => {
        let data = this.state.data

        data.Pen_auto_clean_vr = e.target.checked

        this.setState({
            data: data
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        if (this.props.cleanerLoad) {
            this._getInitData()
            this.props.form.resetFields(['Pen_auto_clean_cdr', 'Phour_clean_cdr', 'Pclean_cdr_interval',
            'Pen_auto_clean_vr', 'Pen_clean_external_storage', 'Pen_auto_clean_monitor', 'Pen_auto_clean_meetme',
            'Pen_auto_clean_queue', 'Pen_auto_clean_vm', 'Pen_auto_clean_fax', 'Pen_auto_clean_backup', 'Pclean_record_threshold',
            'Phour_clean_vr', 'Pclean_record_interval'])
            this.props.setCleanerLoad(false)
        }

        let logList = this.state.log || []
        const spanLogList = logList.map((item, index) => {
            return (
                <row>
                    <Col>
                        <span style={item.indexOf("done") > -1 ? { color: 'green' } : { color: 'red' }}>{item}</span>
                    </Col>
                </row>
                )
        })
        return (
            <div className="app-content-main" id="app-content-main">
                <Form>
                    <div className="lite-desc">
                        { formatMessage({id: "LANG1430"}) }
                    </div>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG644"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="row-section-content">
                        <FormItem
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1432" />}>
                                    <span>{formatMessage({id: "LANG1431"})}</span>
                                </Tooltip>
                            }
                        >
                            { getFieldDecorator('Pen_auto_clean_cdr', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: this.state.data.Pen_auto_clean_cdr
                            })(
                                <Checkbox onChange={ this._onChangeCDR } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1434" />}>
                                    <span>{formatMessage({id: "LANG1433"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('Phour_clean_cdr', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: this.state.data.Pen_auto_clean_cdr,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.data.Pen_auto_clean_cdr ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.data.Pen_auto_clean_cdr ? Validator.range(data, value, callback, formatMessage, 0, 23) : callback()
                                    }
                                }],
                                initialValue: this.state.data.Phour_clean_cdr
                            })(
                                <Input maxLength="2" disabled={ !this.state.data.Pen_auto_clean_cdr } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1436" />}>
                                    <span>{formatMessage({id: "LANG1435"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('Pclean_cdr_interval', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: this.state.data.Pen_auto_clean_cdr,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.data.Pen_auto_clean_cdr ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.data.Pen_auto_clean_cdr ? Validator.range(data, value, callback, formatMessage, 1, 30) : callback()
                                    }
                                }],
                                initialValue: this.state.data.Pclean_cdr_interval
                            })(
                                <Input maxLength="2" disabled={ !this.state.data.Pen_auto_clean_cdr } />
                            ) }
                        </FormItem>
                    </Row>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG645"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="row-section-content">
                        <FormItem
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1438" />}>
                                    <span>{formatMessage({id: "LANG1437"})}</span>
                                </Tooltip>
                            }
                        >
                            { getFieldDecorator('Pen_auto_clean_vr', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: this.state.data.Pen_auto_clean_vr
                            })(
                                <Checkbox onChange={ this._onChangeFile } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG5600" />}>
                                    <span>{formatMessage({id: "LANG5599"})}</span>
                                </Tooltip>
                            }
                        >
                            { getFieldDecorator('Pen_clean_external_storage', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: this.state.data.Pen_clean_external_storage
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3487" />}>
                                    <span>{formatMessage({id: "LANG3486"})}</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={ 2 }>
                                { getFieldDecorator('Pen_auto_clean_monitor', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.data.Pen_auto_clean_monitor
                                })(
                                        <Checkbox disabled={ !this.state.data.Pen_auto_clean_vr } />
                                ) }
                            </Col>
                            <Col span={ 10 }>{formatMessage({id: "LANG4772"}, { 0: formatMessage({id: 'LANG4771'}) })}</Col>
                            <Col span={ 2 }>
                                { getFieldDecorator('Pen_auto_clean_meetme', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.data.Pen_auto_clean_meetme
                                })(
                                        <Checkbox disabled={ !this.state.data.Pen_auto_clean_vr } />
                                ) }
                            </Col>
                            <Col span={ 10 }>{formatMessage({id: "LANG4772"}, { 0: formatMessage({id: 'LANG18'}) })}</Col>
                            <Col span={ 2 }>
                                { getFieldDecorator('Pen_auto_clean_queue', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.data.Pen_auto_clean_queue
                                })(
                                        <Checkbox disabled={ !this.state.data.Pen_auto_clean_vr } />
                                ) }
                            </Col>
                            <Col span={ 10 }>{formatMessage({id: "LANG4772"}, { 0: formatMessage({id: 'LANG24'}) })}</Col>
                            <Col span={ 2 }>
                                { getFieldDecorator('Pen_auto_clean_vm', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.data.Pen_auto_clean_vm
                                })(
                                        <Checkbox disabled={ !this.state.data.Pen_auto_clean_vr } />
                                ) }
                            </Col>
                            <Col span={ 10 }>{formatMessage({id: "LANG4773"}, { 0: formatMessage({id: 'LANG20'}) })}</Col>
                            <Col span={ 2 }>
                                { getFieldDecorator('Pen_auto_clean_fax', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.data.Pen_auto_clean_fax
                                })(
                                        <Checkbox disabled={ !this.state.data.Pen_auto_clean_vr } />
                                ) }
                            </Col>
                            <Col span={ 10 }>{formatMessage({id: "LANG2375"})}</Col>
                            <Col span={ 2 }>
                                { getFieldDecorator('Pen_auto_clean_backup', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.data.Pen_auto_clean_backup
                                })(
                                        <Checkbox disabled={ !this.state.data.Pen_auto_clean_vr } />
                                ) }
                            </Col>
                            <Col span={ 10 }>{formatMessage({id: "LANG4773"}, { 0: formatMessage({id: 'LANG62'}) })}</Col>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1440" />}>
                                    <span>{formatMessage({id: "LANG1439"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('Pclean_record_threshold', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: this.state.data.Pen_auto_clean_vr,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.data.Pen_auto_clean_vr ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.data.Pen_auto_clean_vr ? Validator.range(data, value, callback, formatMessage, 1, 99) : callback()
                                    }
                                }],
                                initialValue: this.state.data.Pclean_record_threshold
                            })(
                                <Input maxLength="2" disabled={ !this.state.data.Pen_auto_clean_vr } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1442" />}>
                                    <span>{formatMessage({id: "LANG1441"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('Phour_clean_vr', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: this.state.data.Pen_auto_clean_vr,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.data.Pen_auto_clean_vr ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.data.Pen_auto_clean_vr ? Validator.range(data, value, callback, formatMessage, 0, 23) : callback()
                                    }
                                }],
                                initialValue: this.state.data.Phour_clean_vr
                            })(
                                <Input maxLength="2" disabled={ !this.state.data.Pen_auto_clean_vr } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1444" />}>
                                    <span>{formatMessage({id: "LANG1443"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('Pclean_record_interval', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: this.state.data.Pen_auto_clean_vr,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.data.Pen_auto_clean_vr ? Validator.digits(data, value, callback, formatMessage) : callback()
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        this.state.data.Pen_auto_clean_vr ? Validator.range(data, value, callback, formatMessage, 1, 30) : callback()
                                    }
                                }],
                                initialValue: this.state.data.Pclean_record_interval
                            })(
                                <Input maxLength="2" disabled={ !this.state.data.Pen_auto_clean_vr } />
                            ) }
                        </FormItem>
                    </Row>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG646"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <div>
                        <Button type="primary" onClick={ this._cleanLog }>{formatMessage({id: "LANG743"})}</Button>
                    </div>
                    <div>
                        <p>
                            <span>
                                { spanLogList }
                            </span>
                        </p>
                    </div>
                </Form>
            </div>
        )
    }
}

Cleaner.propTypes = {
}

export default injectIntl(Cleaner)
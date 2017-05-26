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
const Option = Select.Option
const confirm = Modal.confirm
const baseServerURl = api.apiHost
const CheckboxGroup = Checkbox.Group

class ResetReboot extends Component {
    constructor(props) {
        super(props)

        this.state = {
            mtype: 'data',
            dateShow: "display-block",
            plainOptions: [],
            checkedList: [],
            DataBox: [
                "record",
                "vfax",
                "voicemail_file",
                "hom_file",
                "prompt_tone",
                "cdr_log",
                "zeroconfig",
                "operation_log",
                "backup_file",
                "corefile",
                "troubleshooting",
                "qmail",
                "select_all"
            ],
            resetAll: false
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {
    }

    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const plainOptions = [{
            label: formatMessage({id: "LANG2640"}),
            value: 'record'
        }, {
            label: formatMessage({id: "LANG4773"}, { 0: formatMessage({id: 'LANG95'}) }),
            value: 'vfax'
        }, {
            label: formatMessage({id: "LANG20"}),
            value: 'voicemail_file'
        }, {
            label: formatMessage({id: "LANG27"}),
            value: 'hom_file'
        }, {
            label: formatMessage({id: "LANG4752"}),
            value: 'prompt_tone'
        }, {
            label: formatMessage({id: "LANG4053"}),
            value: 'cdr_log'
        }, {
            label: formatMessage({id: "LANG4773"}, { 0: formatMessage({id: 'LANG16'}) }),
            value: 'zeroconfig'
        }, {
            label: formatMessage({id: "LANG3908"}),
            value: 'operation_log'
        }, {
            label: formatMessage({id: "LANG4773"}, { 0: formatMessage({id: 'LANG62'}) }),
            value: 'backup_file'
        }, {
            label: formatMessage({id: "LANG4807"}),
            value: 'corefile'
        }, {
            label: formatMessage({id: "LANG4773"}, { 0: formatMessage({id: 'LANG68'}) }),
            value: 'troubleshooting'
        }, {
            label: formatMessage({id: "LANG4773"}, { 0: formatMessage({id: 'LANG2032'}) }),
            value: 'qmail'
        }]
        this.setState({
            plainOptions: plainOptions
        })
    }
    _handleFormChange = (changedFields) => {
        _.extend(this.props.dataSource, changedFields)
    }
    _onMtypeChange = (value) => {
        this.setState({
            mtype: value
        })
    }
    _onChangeOne = (checkedList) => {
        const plainOptions = this.state.plainOptions
        this.setState({
            checkedList: checkedList,
            cleanAll: checkedList.length === plainOptions.length
        })
        // this.props.getSpecialState(checkedList)
    }
    _onAllChange = (e) => {
        let checkedList = []
        const plainOptions = this.state.plainOptions
        plainOptions.map(function(item) {
            checkedList.push(item.value)
        })
        this.setState({
            checkedList: e.target.checked ? checkedList : [],
            cleanAll: e.target.checked
        })
    }
    _doReset = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

         let mtype = form.getFieldValue("mtype") 

            if (mtype === 'all') {
                UCMGUI.loginFunction.confirmReset(baseServerURl + 'action=factoryReset&type=' + mtype, formatMessage)
            } else {
                message.loading(formatMessage({ id: "LANG4830"}))

                let data = {
                    action: "updateModuleResetData",
                    mod_reset_enable: 1
                }
                this.state.DataBox.map(function(item) {
                    data[item] = "no"
                })
                this.state.checkedList.map(function(item) {
                    data[item] = "yes"
                })
                delete data.select_all

                $.ajax({
                    url: baseServerURl,
                    type: "POST",
                    dataType: "json",
                    async: false,
                    data: data,
                    error: function(jqXHR, textStatus, errorThrown) {
                        message.error(errorThrown)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, formatMessage)

                        if (bool) {
                            $.ajax({
                                type: 'GET',
                                url: baseServerURl + 'action=ResetModuleData&module-reset=',
                                success: function(data) {
                                    const bool = UCMGUI.errorHandler(data, null, formatMessage)

                                    if (bool) {
                                        message.success(<span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG4831"}) }}></span>)
                                    }
                                }
                            })
                        }
                    }
                })
            }
    }
    _reset = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props
        let mtype = form.getFieldValue("mtype") 

        if (mtype !== 'all' && this.state.checkedList.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG3456"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            const typeName = {
                data: formatMessage({id: "LANG1488"}),
                all: formatMessage({id: "LANG104"}) 
            }

            const typeLabel = typeName[this.state.mtype]
            const content = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG837" }, {0: typeLabel})}}></span>

            Modal.confirm({
                    content: content,
                    okText: formatMessage({id: "LANG727"}),
                    cancelText: formatMessage({id: "LANG726"}),
                    onOk: this._doReset.bind(this)
                })
        }
    }
    _doReboot = () => {
        const { formatMessage } = this.props.intl
        const { form } = this.props

        UCMGUI.loginFunction.confirmReboot()
    }
    _reboot = () => {
        const { formatMessage } = this.props.intl

        Modal.confirm({
                content: formatMessage({id: "LANG835"}),
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"}),
                onOk: this._doReboot.bind(this)
            })
    }
    _resetCert = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "GET",
            url: baseServerURl + "action=cerifyCertificateFile",
            error: function(jqXHR, textStatus, errorThrown) {
                message.error(errorThrown)
            },
            success: function(data) {
                var bool = data.status

                if (bool === 0) {
                    message.success(<span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG4200" }) }}></span>)
                } else {
                    message.error(<span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG4202"}, { 0: formatMessage({id: 'LANG4200'}) }) }}></span>)
                }
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const checkedList = this.state.checkedList
        const plainOptions = this.state.plainOptions
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        return (
            <div className="app-content-main" id="app-content-main">
                <Form>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG650"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="row-section-content">
                        <FormItem
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG2253" />}>
                                    <span>{formatMessage({id: "LANG84"})}</span>
                                </Tooltip>
                            }
                        >
                            { getFieldDecorator('mtype', {
                                rules: [],
                                initialValue: this.state.mtype
                            })(
                                <Select onChange={this._onMtypeChange}>
                                     <Option value="data">{formatMessage({id: "LANG1488"})}</Option>
                                     <Option value="all">{formatMessage({id: "LANG104"})}</Option>
                                 </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            className={ this.state.mtype === "all" ? "hidden" : "display-block" }
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG5293" />}>
                                    <span>{formatMessage({id: "LANG4805"})}</span>
                                </Tooltip>
                            )}>
                            <CheckboxGroup options={ plainOptions } value={ checkedList } onChange={ this._onChangeOne }/>
                            <Col span={ 2 }>
                                <Checkbox checked={ this.state.cleanAll } onChange={ this._onAllChange }/>
                            </Col>
                            <Col span={ 6 }>{formatMessage({id: "LANG104"})}</Col>
                        </FormItem>
                        <div>
                            <Button type="primary" onClick={ this._reset }>{formatMessage({id: "LANG750"})}</Button>
                        </div>
                    </Row>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG737"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <div>
                        <Button type="primary" onClick={ this._reboot }>{formatMessage({id: "LANG737"})}</Button>
                    </div>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG4200"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <div>
                        <Button type="primary" onClick={ this._resetCert }>{formatMessage({id: "LANG4200"})}</Button>
                    </div>
                </Form>
            </div>
        )
    }
}

ResetReboot.propTypes = {
}

export default Form.create()(injectIntl(ResetReboot))
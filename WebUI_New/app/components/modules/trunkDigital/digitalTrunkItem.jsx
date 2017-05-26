'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Modal, Button, Row, Col, Checkbox, message, Tooltip, Select, Tabs, Spin } from 'antd'
import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import Validator from "../../api/validator"
import Title from '../../../views/title'
import UCMGUI from "../../api/ucmgui"

const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost

class DigitalTrunkItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            firstLoad: true,
            digitaltrunk: {},
            // digitalGroup: [],
            faxIntelligentRouteDestinationOpts: []
        }
        this._onChangeFaxdetect = (e) => {
            let isChecked = false

            if (_.isString(e)) {
                isChecked = (e === "yes" ? true : false)
            } else {
                isChecked = e.target.checked
            }

            if (isChecked) {
                this.setState({
                    div_detect_style: true
                })
            } else {
                this.setState({
                    div_detect_style: false
                })
            }
        }
        this._onChangefaxIntelligentRoute = (e) => {
            let isChecked = e.target.checked,
                digitaltrunk = this.state.digitaltrunk

            if (isChecked) {
                digitaltrunk["fax_intelligent_route"] = "yes"
            } else {
                digitaltrunk["fax_intelligent_route"] = "no"
            }
            this.setState({
                digitaltrunk: digitaltrunk
            })
        }
    }
    componentDidMount() {
        const form = this.props.form
        let mode = this.props.route.path,
            params = this.props.params,
            locationState = this.props.location.state

        this._tectFax()

        if (mode.indexOf('edit') === 0) {
            let trunkType = locationState.trunkType,
                trunkId = params.trunkId

            this._hideCallee(trunkType)
            this._getDigitalTrunk(trunkId)
        } else {
            this._getDigitalHardwareSettings()
        }
    }
    componentWillUnmount() {
    }
    componentDidUpdate() {
        const form = this.props.form

        let digitaltrunk = this.state.digitaltrunk

        if (this.state.firstLoad && !_.isEmpty(digitaltrunk)) {

        }
    }
    _hideCallee = (trunkType) => {
        if (trunkType && trunkType.match(/em/i)) {
            this.setState({
                div_hide_callee_style: false
            })
        }
    }
    _tectFax = () => {
        const { formatMessage } = this.props.intl

        let accountList = UCMGUI.isExist.getList("listAccount").account,
            faxList = UCMGUI.isExist.getList("listFax").fax,
            arr = [{
                val: "",
                text: formatMessage({id: "LANG133"})
            }],
            obj = {}

        for (let i = 0; i < accountList.length; i++) {
            obj = accountList[i]

            if (obj.account_type.match(/FXS/i)) {
                arr.push({
                    val: obj.extension
                })
            }
        }
        for (let i = 0; i < faxList.length; i++) {
            obj = faxList[i]

            arr.push({
                val: obj.extension
            })
        }

        this.setState({
            faxIntelligentRouteDestinationOpts: arr
        })
    }
    _getDigitalHardwareSettings = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "GET",
            url: baseServerURl + "action=getDigitalHardwareSettings",
            dataType: 'json',
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    let sDigitalType = data.response.digital_driver_settings[0].signalling

                    this._hideCallee(sDigitalType)
                }
            }.bind(this)
        })
    }
    _getDigitalTrunk = (trunkId) => {
        const { formatMessage } = this.props.intl
        const form = this.props.form

        let action = {
            "action": "getDigitalTrunk",
            "trunk": trunkId
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    let digitaltrunk = data.response.trunk

                    if (digitaltrunk.fax_intelligent_route_destination === "") {
                        form.setFieldsValue({
                            fax_intelligent_route_destination: "no"
                        })
                    }

                    let groupIndex = digitaltrunk.group_index

                    this._onChangeFaxdetect(digitaltrunk.faxdetect)

                    this.setState({
                        digitaltrunk: digitaltrunk
                    })
                }
            }.bind(this)
        })
    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl
        const form = this.props.form

        let trunkId = this.props.params.trunkId,
            action = {},
            mode = this.props.route.path,
            isEdit = (mode.indexOf('edit') === 0),
            isAdd = (mode.indexOf('add') === 0)

        this.props.form.validateFieldsAndScroll((err, values) => {
            let me = this
            let refs = this.refs

            for (let key in values) {
                if (values.hasOwnProperty(key)) {
                    let divKey = refs["div_" + key]
                    if (divKey &&
                       divKey.props &&
                        ((divKey.props.className &&
                        divKey.props.className.indexOf("hidden") === -1) ||
                        typeof divKey.props.className === "undefined")) {
                        if (!err || (err && typeof err[key] === "undefined")) {
                            action[key] = UCMGUI.transCheckboxVal(values[key])
                        } else {
                            return
                        }
                    } else if (typeof divKey === "undefined") {
                        if (!err || (err && typeof err[key] === "undefined")) {
                            action[key] = UCMGUI.transCheckboxVal(values[key])
                        } else {
                            return
                        }
                    }
                }
            }
            message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG904" })}}></span>, 0)

            if (isAdd) {
                action["technology"] = "PRI"
            } else if (isEdit) {
               action["trunk"] = trunkId
            }
            action["action"] = (isEdit ? "updateDigitalTrunk" : "addDigitalTrunk")
            this._updateOrAddTrunkInfo(action)
        })
    }
    _handleCancel = (e) => {
        browserHistory.push('/extension-trunk/digitalTrunk')
    }
    _updateOrAddTrunkInfo = (action) => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                message.destroy()
                message.error(errorThrown)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                    browserHistory.push('/extension-trunk/digitalTrunk')
                }
            }.bind(this)
        })
    }
    _trunkNameIsExist = (rule, value, callback, errMsg) => {
        let _this = this,
            mode = this.props.route.path,
            params = this.props.params,
            isEdit = (mode.indexOf('edit') === 0),
            isAdd = (mode.indexOf('add') === 0)

        if (value && value.length >= 2) {
            if (_.find(this.props.location.state.trunkNameList, function (num) {
                if (isEdit) {
                    return (num === value && params && params.trunkName !== value)
                } else if (isAdd) {
                    return num === value
                }
            })) {
                callback(errMsg)
            }
            callback()
        }
        callback()
    }
    _transDigitalGroup = () => {
        let state = this.state,
            locationState = this.props.location.state,
            digitaltrunk = state.digitaltrunk,
            digitalGroup = locationState.digitalGroup,
            groupNameList = locationState.groupNameList,
            digitalGroupList = []

        for (let i = 0; i < digitalGroup.length; i++) {
            let digitalGroupIndex = digitalGroup[i]
            let obj = {}

            obj["text"] = digitalGroupIndex.group_name
            obj["val"] = digitalGroupIndex.group_index
            obj["disabled"] = false

            let isFind = _.find(groupNameList, function(num) {
                return digitalGroupIndex.group_index === Number(num)
            })

            if (typeof isFind !== "undefined" && Number(digitaltrunk.group_index) !== digitalGroupIndex.group_index) {
                obj["disabled"] = true
            }

            digitalGroupList.push(obj)
        }
        return digitalGroupList
    }
    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        let state = this.state,
            digitaltrunk = state.digitaltrunk,
            params = this.props.params,
            mode = this.props.route.path,
            isEdit = (mode.indexOf('edit') === 0),
            digitalGroupList = this._transDigitalGroup()

        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    headerTitle={ isEdit ? formatMessage({
                            id: "LANG642"
                        }, {
                            0: formatMessage({id: "LANG3143"}),
                            1: params.trunkName
                        }) : formatMessage({id: "LANG3142"})
                    }
                    onSubmit={ this._handleSubmit.bind(this) }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                />
                <Spin spinning={this.state.loading}>
                    <Form>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3144" />}>
                                            <span>{formatMessage({id: "LANG1351"})}</span>
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
                                                Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.minlength(data, value, callback, formatMessage, 2)
                                            }
                                        }, {
                                            validator: (data, value, callback) => {
                                                let errMsg = formatMessage({id: "LANG2137"}, {0: 1, 1: formatMessage({id: "LANG1329"})})
                                                this._trunkNameIsExist(data, value, callback, errMsg)
                                            }
                                        }],
                                        initialValue: digitaltrunk.trunk_name || ""
                                    })(
                                        <Input maxLength="16" />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3145" />}>
                                            <span>{formatMessage({id: "LANG3162"})}</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('group_index', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: digitaltrunk.group_index || ""
                                    })(
                                        <Select>
                                        {
                                            digitalGroupList.map(function(it) {
                                                let val = it.val,
                                                    text = it.text,
                                                    disabled = it.disabled

                                                return <Option key={ val } value={ val } disabled={ disabled }>
                                                       { text ? text : val }
                                                    </Option>
                                            })
                                        }
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div ref="div_hide_callee" className={ state.div_hide_callee_style === false ? "hidden" : "display-block" }>
                            <Row>
                                <Col span={12}>
                                    <FormItem
                                        ref="div_hidecallerid"
                                        className={ state.div_hide_callee_style === false ? "hidden" : "display-block" }
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG3147" />}>
                                                <span>{formatMessage({id: "LANG3146"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('hidecallerid', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: digitaltrunk.hidecallerid === "yes" ? true : false
                                        })(
                                            <Checkbox />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        ref="div_keepcid"
                                        className={ state.div_hide_callee_style === false ? "hidden" : "display-block" }
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG2319" />}>
                                                <span>{formatMessage({id: "LANG2318"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('keepcid', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: digitaltrunk.keepcid === "yes" ? true : false
                                        })(
                                            <Checkbox />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <FormItem
                                        ref="div_callerid"
                                        className={ state.div_hide_callee_style === false ? "hidden" : "display-block" }
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG3389" />}>
                                                <span>{formatMessage({id: "LANG1359"})}</span>
                                            </Tooltip>
                                        )}>
                                        { getFieldDecorator('callerid', {
                                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: digitaltrunk.callerid || ""
                                        })(
                                            <Input maxLength="32" />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        ref="div_cidname"
                                        className={ state.div_hide_callee_style === false ? "hidden" : "display-block" }
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3390" /> }>
                                                <span>{formatMessage({id: "LANG1361"})}</span>
                                            </Tooltip>
                                        )}>
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
                                                    Validator.alphanumeric(data, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: digitaltrunk.cidname || ""
                                        })(
                                            <Input maxLength="64" />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG2544" />}>
                                            <span>{formatMessage({id: "LANG2543"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('auto_recording', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: digitaltrunk.auto_recording === "yes" ? true : false
                                    })(
                                        <Checkbox />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG1136" />}>
                                            <span>{formatMessage({id: "LANG1135"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('faxdetect', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: digitaltrunk.faxdetect === "yes" ? true : false
                                    })(
                                        <Checkbox onChange={ this._onChangeFaxdetect }/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div ref="div_detect" className={ state.div_detect_style === true ? "display" : "hidden"}>
                            <Row>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4380" />}>
                                                <span>{formatMessage({id: "LANG4379"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('fax_intelligent_route', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: digitaltrunk.fax_intelligent_route === "yes" ? true : false
                                        })(
                                            <Checkbox onChange={ this._onChangefaxIntelligentRoute }/>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={
                                            <Tooltip title={<FormattedHTMLMessage id="LANG4382" />}>
                                                <span>{formatMessage({id: "LANG4381"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('fax_intelligent_route_destination', {
                                            rules: [],
                                            initialValue: digitaltrunk.fax_intelligent_route_destination || ""
                                        })(
                                            <Select disabled={ digitaltrunk.fax_intelligent_route === "yes" ? false : true }>
                                            {
                                                state.faxIntelligentRouteDestinationOpts.map(function(it) {
                                                    let val = it.val,
                                                        text = it.text

                                                    return <Option key={ val } value={ val }>
                                                           { text ? text : val }
                                                        </Option>
                                                })
                                            }
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    ref="div_pulsedial"
                                    className={ this.div_pulsedial_style === true ? "display-block" : "hidden"}
                                    { ...formItemLayout }
                                    label={
                                        <Tooltip title={<FormattedHTMLMessage id="LANG3149" />}>
                                            <span>{formatMessage({id: "LANG3148"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('pulsedial', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: digitaltrunk.pulsedial === "yes" ? true : false
                                    })(
                                        <Checkbox />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </div>
        )
    }
}

DigitalTrunkItem.defaultProps = {
}

DigitalTrunkItem.propTypes = {
}

export default Form.create()(injectIntl(DigitalTrunkItem))

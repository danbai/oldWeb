'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { injectIntl, FormattedHTMLMessage } from 'react-intl'
import Title from '../../../views/title'
import { Form, Input, message, Tabs, Modal, Tooltip, Select, Button } from 'antd'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'

const TabPane = Tabs.TabPane
const confirm = Modal.confirm
const FormItem = Form.Item
const Option = Select.Option
const mappingErrCode = {
    "-1": "LANG2931", // "time out"
    0: "LANG2932", // "no error return"
    1: "LANG2933", // "CPT detect is running"
    2: "LANG2934", // "ACIM detect is running"
    3: "LANG2936", // "unload dahdi module failed"
    4: "LANG2935", // "ACIM thread create failed"
    5: "LANG2937", // "fxo: cannot be opened, absent or busy"
    6: "LANG2938", // "fxo: read status failed"
    7: "LANG2939", // "fxo: not connect"
    8: "LANG2940", // "fxo: set signed linear mode failed"
    9: "LANG2941", // "fxo: cannot get buffer information"
    10: "LANG2942", // "fxo: set buffer information failed"
    11: "LANG2943", // "fxo: bring offhook failed"
    12: "LANG2944", // "fxo: unable to get a clear outside line"
    13: "LANG2945", // "fxo: unable to set echo coefficients"
    14: "LANG2946", // "fxo: unable to flush port buffer"
    15: "LANG2947" // "fxo: could not write all data to line"
    // 16: "end of error string"
}
class AnalogItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            fxo_settings: [],
            fxs_settings: [],
            hardware_global_settings: {}
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillMount() {
    }
    componentWillUnmount() {
    }
    _getInitData = () => {
        let prefSetting = {}
        let ivrStart = ''
        let ivrEnd = ''
        let disable_extension_ranges = ''

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getAnalogSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    const fxo_settings = response.fxo_settings
                    const fxs_settings = response.fxs_settings
                    const hardware_global_settings = response.hardware_global_settings
                    this.setState({
                        fxs_settings: fxs_settings,
                        fxo_settings: fxo_settings,
                        hardware_global_settings: hardware_global_settings
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        }
    _handleCancel = (e) => {
        browserHistory.push('/pbx-settings/interfaceSettings/2')
    }
    _handleSubmit = (e) => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const IvrId = this.props.params.id

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
            }
            const fxs_settings = this.state.fxs_settings
            const fxo_settings = this.state.fxo_settings
            const type = this.props.params.type
            let action = {}
            action.action = 'updateAnalogSettings'
            if (type === 'fxs') {
                const sig_1 = values.sig_1
                const sig_2 = values.sig_2
                action.sig = '{"chan1":"' + sig_1 + '","chan2":"' + sig_2 + '"}'
            } else if (type === 'fxo') {
                const fxoChansNum = Number(JSON.parse(localStorage.getItem('model_info')).num_fxo)
                let fxoChans = {}
                let echocefs = {}
                for (let i = 1; i <= fxoChansNum; i++) {
                    fxoChans[`chan${i}`] = values[`acim${i}`]
                    echocefs[`chan${i}`] = '0,0,0,0,0,0,0,0'
                    if (values[`acim${i}`] !== (fxo_settings[i - 1].acim + '')) {
                        action["ifACIMautodetect"] = "yes"
                    }
                }
                action.acim = JSON.stringify(fxoChans)
                action.echocefs = JSON.stringify(echocefs)
                action.acim_option = values.acim_option
            }
            $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                        }
                        this._handleCancel()
                    }.bind(this)
                })
        })
    }
    _reflesh_status = () => {
        const { formatMessage } = this.props.intl
        const { getFieldValue, setFieldsValue } = this.props.form
        const __this = this
        let portList = []
        const fxoChansNum = Number(JSON.parse(localStorage.getItem('model_info')).num_fxo)
        const loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2337" })}}></span>
        for (let i = 1; i <= fxoChansNum; i++) {
            portList.push(i)
        }
        const portListStr = portList.join(',')
        const action = {
            action: "getPSTNDetecting",
            pstn_type: "pstn_acim",
            acim: portListStr
        }
        $.ajax({
            type: "GET",
            url: api.apiHost,
            dataType: "json",
            async: false,
            data: action,
            error: function(e) {
                message.destroy()
                message.error(e.statusText)
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, __this.props.intl.formatMessage)

                if (bool) {
                    let result = data.response.result
                    let totalState = data.response.total_state
                    let totalErr = data.response.total_err
                    let errorData = ""

                    if (totalState !== "done") {
                        setTimeout(__this._reflesh_status, 5000)
                        // message.loading(loadingMessage, 5)
                    } else {
                        let needModalError = false
                        $.each(result, function(index, val) {
                            var eleId = val.chan
                            var eleVal = val.pstn_acim
                            var echocefs = val.pstn_echocefs
                            var errCode = val.errCode
                            if (Number(errCode) !== 0) {
                                errorData += formatMessage({id: "LANG101"}) + eleId + "   " + formatMessage({id: mappingErrCode[errCode]}) + "<br>"
                                needModalError = true
                            } else {
                                let obj = {}

                                obj[`acim${eleId}`] = eleVal + ''
                                setFieldsValue(obj)
                            }
                        })
                        if (needModalError) {
                            message.destroy()
                            Modal.error({
                                content: <span dangerouslySetInnerHTML={{__html: errorData}}></span>,
                                okText: formatMessage({id: "LANG727"})
                            })
                        }
                    }
                }
            }
        })
    }
    _acimDetect = () => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const __this = this
        const loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2337" })}}></span>
        let portList = []
        const fxoChansNum = Number(JSON.parse(localStorage.getItem('model_info')).num_fxo)
        for (let i = 1; i <= fxoChansNum; i++) {
            portList.push(i)
        }
        const portListStr = portList.join(',')
        const action = {
            action: "startPSTNDetecting",
            pstn_type: "pstn_acim",
            acim: portListStr,
            acim_option: getFieldValue('acim_option')
        }
        message.loading(loadingMessage, 0)

        $.ajax({
            type: "POST",
            url: api.apiHost,
            dataType: "json",
            async: false,
            data: action,
            error: function(e) {
                message.destroy()
                message.error(e.statusText)
            },
            success: function(data) {
                // message.loading(loadingMessage, 5)
                const bool = UCMGUI.errorHandler(data, null, __this.props.intl.formatMessage)

                if (bool) {
                    setTimeout(__this._reflesh_status, 5000)
                }
            }
        })
    } 
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const fxs_settings = this.state.fxs_settings
        const fxo_settings = this.state.fxo_settings
        const hardware_global_settings = this.state.hardware_global_settings 

        const title = (this.props.params.type === 'fxs' ? formatMessage({id: "LANG780"}) : formatMessage({id: "LANG2343"}))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const fxoChansNum = Number(JSON.parse(localStorage.getItem('model_info')).num_fxo)
        let fxoChans = []
        for (let i = 1; i <= fxoChansNum; i++) {
            fxoChans.push(i)
        }
        const portItem = fxoChans.map((item, index) => {
            return (
                <FormItem
                    { ...formItemLayout }

                    label={(
                        <Tooltip>
                            <span>{formatMessage({id: "LANG2993"}, {0: item})}</span>
                        </Tooltip>
                    )}>
                    { getFieldDecorator(`acim${item}`, {
                        rules: [],
                        initialValue: fxo_settings[index] ? fxo_settings[index].acim + '' : '0'
                    })(
                        <Select>
                            <Option value="0">600 Ω</Option>
                            <Option value="1">900 Ω</Option>
                            <Option value="2">270 Ω + (750 Ω || 150 nF) and 275 Ω + (780 Ω || 150 nF)</Option>
                            <Option value="3">220 Ω + (820 Ω || 120 nF) and 220 Ω + (820 Ω || 115 nF)</Option>
                            <Option value="4">370 Ω + (620 Ω || 310 nF)</Option>
                            <Option value="5">320 Ω + (1050 Ω || 230 nF)</Option>
                            <Option value="6">370 Ω + (820 Ω || 110 nF)</Option>
                            <Option value="7">275 Ω + (780 Ω || 115 nF)</Option>
                            <Option value="8">120 Ω + (820 Ω || 110 nF)</Option>
                            <Option value="9">350 Ω + (1000 Ω || 210 nF)</Option>
                            <Option value="10">200 Ω + (680 Ω || 100 nF)</Option>
                            <Option value="11">600 Ω + 2.16 μF</Option>
                            <Option value="12">900 Ω + 1 μF</Option>
                            <Option value="13">900 Ω + 2.16 μF</Option>
                            <Option value="14">600 Ω + 1 μF</Option>
                            <Option value="15">{ formatMessage({id: "LANG1730"}) }</Option>
                        </Select>
                    ) }
                </FormItem>
                )
        })

        return (
            <div className="app-content-main app-content-extension">
                <Title
                    headerTitle={ title }
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit.bind(this) }
                    saveTxt={ formatMessage({id: "LANG770"}) }
                    cancelTxt={ formatMessage({id: "LANG726"}) }
                    isDisplay='display-block'
                />
                <div className="content">
                    <Form className={this.props.params.type === 'fxs' ? 'display-block' : 'hidden'}>
                        <FormItem
                            ref="div_sig_1"
                            { ...formItemLayout }

                            label={(
                               <Tooltip title={<FormattedHTMLMessage id="LANG2986" />}>
                                    <span>{formatMessage({id: "LANG2993"}, {0: 1})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('sig_1', {
                                rules: [],
                                initialValue: fxs_settings[0] ? fxs_settings[0].sig : 'ls'
                            })(
                                <Select>
                                    <Option value='ks'>Kewl Start</Option>
                                    <Option value='ls'>Loop Start</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_sig_2"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2986" />}>
                                    <span>{formatMessage({id: "LANG2993"}, {0: 2})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('sig_2', {
                                rules: [],
                                initialValue: fxs_settings[1] ? fxs_settings[1].sig : 'ls'
                            })(
                                <Select>
                                    <Option value='ks'>Kewl Start</Option>
                                    <Option value='ls'>Loop Start</Option>
                                </Select>
                            ) }
                        </FormItem>
                    </Form>
                    <Form className={this.props.params.type === 'fxo' ? 'display-block' : 'hidden'}>
                        <FormItem
                            ref="div_acim_btn"
                            { ...formItemLayout }

                            label={(
                               <Tooltip title={<FormattedHTMLMessage id="LANG2341" />}>
                                    <span>{formatMessage({id: "LANG2340"})}</span>
                                </Tooltip>
                            )}>
                                <Button type="primary" size="default" onClick={ this._acimDetect}>
                                    { formatMessage({id: "LANG2325"}) }
                                </Button>
                        </FormItem>
                        <FormItem
                            ref="div_acim_option"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG5136" />}>
                                    <span>{formatMessage({id: "LANG5136"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('acim_option', {
                                rules: [],
                                initialValue: hardware_global_settings.acim_option ? hardware_global_settings.acim_option : 'erl'
                            })(
                                <Select>
                                    <Option value='erl'>{ formatMessage({id: "LANG5137"}) }</Option>
                                    <Option value='pr'>{ formatMessage({id: "LANG5138"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                        { portItem }
                    </Form>
                </div>
            </div>
        )
    }
}

AnalogItem.propTypes = {}

export default Form.create()(injectIntl(AnalogItem))

'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class AnnouncementCenter extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fileList: [],
            centerItem: {},
            codeNameList: [],
            codeNumberList: [],
            groupNumberList: [],
            numberList: [],
            otherNumberList: [],
            portExtensionList: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getCodeList()
        this._getGroupList()
        this._getInitData()
        this._getNumberList()
        this._getPortExtension()
    }
    _gotoPrompt = () => {
        const { formatMessage } = this.props.intl
        const __this = this
        confirm({
            title: (formatMessage({id: "LANG543"})),
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG28"})})}} ></span>,
            onOk() {
                browserHistory.push('/pbx-settings/voicePrompt/2')
            },
            onCancel() {},
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
        })
    }
    _removeSuffix = (filename) => {
        let name = filename.toLocaleLowerCase(),
            file_suffix = [".mp3", ".wav", ".gsm", ".ulaw", ".alaw"]

        for (let i = 0; i < file_suffix.length; i++) {
            let num = name.lastIndexOf(file_suffix[i])

            if (num !== -1 && name.endsWith(file_suffix[i])) {
                filename = filename.substring(0, num)

                return filename
            }
        }
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const centerName = this.props.params.name

        if (centerName && value && centerName === value) {
            callback()
        } else if (value && _.indexOf(this.state.codeNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkExtension = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const centerId = this.props.params.id

        if (centerId && value && centerId === value) {
            callback()
        } else if (value && _.indexOf(this.state.numberList, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else if (value && _.indexOf(this.state.codeNumberList, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _checkIfInPort = (rules, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.portExtensionList, parseInt(value)) > -1) {
            callback(formatMessage({id: "LANG2172"}, {0: formatMessage({id: "LANG1244"}), 1: formatMessage({id: "LANG1242"})}))
        } else {
            callback()
        }
    }
    _checkIfContainOtherCodes = (rule, value, callback) => {
        const centerId = this.props.params.id

        if (centerId && value && centerId === value) {
            callback()
        } else if (value) {
            const { formatMessage } = this.props.intl
            const me = this
            var contain = false,
                codeNumberList = this.state.codeNumberList,
                groupNumberList = this.state.groupNumberList,
                numberList = this.state.numberList,
                portExtensionList = this.state.portExtensionList

            codeNumberList.map(function(item) {
                if (me._beginsWith(value, item)) {
                    contain = true
                    callback(formatMessage({id: "LANG5378"}))
                    return
                } else if (me._beginsWith(item, value)) {
                    contain = true
                    callback(formatMessage({id: "LANG5378"}))
                    return
                }
            })
            groupNumberList.map(function(item) {
                if (_.indexOf(numberList, (value + '' + item)) > -1) {
                    contain = true
                    callback(formatMessage({id: "LANG5378"}))
                    return
                }
                if (_.indexOf(portExtensionList, parseInt(value + '' + item)) > -1) {
                    callback(formatMessage({id: "LANG2172"}, {0: formatMessage({id: "LANG1244"}), 1: formatMessage({id: "LANG1242"})}))
                    return
                }
            })

            if (contain) {
                callback(formatMessage({id: "LANG5378"}))
            } else {
                callback()
            }
        } else {
            callback()
        }
    }
    _beginsWith = (value, sub) => {
        if (value && sub && value.length > sub.length) {
            const len = sub.length
            const tmp = value.slice(0, len)
            if (tmp === sub) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }
    _getPortExtension = () => {
        const { formatMessage } = this.props.intl

        let portExtensionList = []

        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                action: "getFeatureCodes"
            },
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                var bool = UCMGUI.errorHandler(data)

                if (bool) {
                    var featureSettings = data.response.feature_settings,
                        parkext = featureSettings.parkext,
                        parkpos = featureSettings.parkpos.split('-')

                    portExtensionList.push(parseInt(parkext, 10))

                    for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                        portExtensionList.push(i)
                    }
                }
            }
        })

        this.setState({
            portExtensionList: portExtensionList
        })
    }
    _getCodeList = () => {
        let codeNameList = this.state.codeNameList || []
        let codeNumberList = this.state.codeNumberList || []
        const __this = this

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listCodeblueCode'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    response.codeblue_code.map(function(item) {
                        codeNameList.push(item.code_name)
                        codeNumberList.push(item.extension)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            codeNameList: codeNameList,
            codeNumberList: codeNumberList
        })
    }
    _getGroupList = () => {
        let groupNumberList = this.state.groupNumberList || []
        const __this = this

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listCodeblueGroup'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    response.codeblue_group.map(function(item) {
                        groupNumberList.push(item.extension)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            groupNumberList: groupNumberList
        })
    }
    _getInitData = () => {
        const centerId = this.props.params.id
        const centerName = this.props.params.name
        let codeNameList = this.state.codeNameList || []
        let codeNumberList = this.state.codeNumberList || []
        let fileList = []
        let centerItem = {}
        const __this = this

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listFile',
                type: 'ivr',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["mp3","wav","gsm","ulaw","alaw"]}',
                sidx: 'n',
                sord: 'desc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    response.ivr.map(function(item) {
                        let obj = { 
                            text: item.n,
                            val: "record/" + __this._removeSuffix(item.n)
                        }
                        fileList.push(obj)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (centerId) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getCodeblueCode',
                    codeblue_code: centerId
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        centerItem = res.response.codeblue_code || {}
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }
        if (centerId) {
            codeNumberList = _.without(codeNumberList, centerId)
        }
        if (centerName) {
            codeNameList = _.without(codeNameList, centerName)
        }

        this.setState({
            fileList: fileList,
            centerItem: centerItem,
            codeNameList: codeNameList,
            codeNumberList: codeNumberList
        })
    }
    _getNumberList = () => {
        let numberList = this.state.numberList || []
        const __this = this

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getNumberList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    numberList = response.number
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        const codeNumberList = this.state.codeNumberList
        const groupNumberList = this.state.groupNumberList
        let otherNumberList = this.state.otherNumberList
        codeNumberList.map(function(code) {
            groupNumberList.map(function(group) {
                otherNumberList.push(code + '' + group)
            })
        })

        this.setState({
            numberList: numberList,
            otherNumberList: otherNumberList
        })
    }
    _handleCancel = () => {
        browserHistory.push('/value-added-features/announcementCenter')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const centerId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = {}
                action.code_name = values.code_name
                action.code_prompt = values.code_prompt
                action.code_timeout = values.code_timeout

                if (centerId) {
                    action.action = 'updateCodeblueCode'
                    action.codeblue_code = centerId
                } else {
                    action.action = 'addCodeblueCode'
                    action.extension = values.codeblue_code
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
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const formItemPromptLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 9 }
        }
        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG4338"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG4338"}) }))

        const centerItem = this.state.centerItem || {}

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                />
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_code_name"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG135" />}>
                                    <span>{formatMessage({id: "LANG135"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('code_name', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 2)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 64)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkName
                                }],
                                width: 100,
                                initialValue: centerItem.code_name
                            })(
                                <Input maxLength="128" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_codeblue_code"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4344" />}>
                                    <span>{formatMessage({id: "LANG4341"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('codeblue_code', {
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
                                    validator: this._checkExtension
                                }, {
                                    validator: this._checkIfContainOtherCodes
                                }],
                                width: 100,
                                initialValue: centerItem.extension
                            })(
                                <Input maxLength="128" disabled={ this.props.params.id ? true : false } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_code_prompt"
                            { ...formItemPromptLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4343" />}>
                                    <span>{formatMessage({id: "LANG28"})}</span>
                                </Tooltip>
                            )}>
                            <Col span={ 16 }>
                            { getFieldDecorator('code_prompt', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                width: 100,
                                initialValue: centerItem.code_prompt ? centerItem.code_prompt : ""
                            })(
                                <Select>
                                    {
                                        this.state.fileList.map(function(item) {
                                            return <Option
                                                    key={ item.val }
                                                    value={ item.val }>
                                                    { item.text }
                                                </Option>
                                            }
                                        ) 
                                    }
                                </Select>
                            ) }
                            </Col>
                            <Col span={6} offset={1} >
                                <a className="prompt_setting" onClick={ this._gotoPrompt } >{ formatMessage({id: "LANG1484"}) }</a>
                            </Col>
                        </FormItem>
                        <FormItem
                            ref="div_code_timeout"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1598" />}>
                                    <span>{formatMessage({id: "LANG1598"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('code_timeout', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 3, 600)
                                    }
                                }],
                                width: 100,
                                initialValue: centerItem.code_timeout ? centerItem.code_timeout : 30
                            })(
                                <Input min={3} max={600} maxLength="3" />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(AnnouncementCenter))
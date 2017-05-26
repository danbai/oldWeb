'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Icon, Modal } from 'antd'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

let uuid = 1

class AMIItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ipList: [],
            netmaskList: [],
            userItem: {},
            priAll: false,
            priList: [],
            amiUserList: [],
            plainOptions: [{
                label: 'originate',
                value: 'originate'
            }, {
                label: 'call',
                value: 'call'
            }, {
                label: 'cdr',
                value: 'cdr'
            }, {
                label: 'agent',
                value: 'agent'
            }, {
                label: 'cc',
                value: 'cc'
            }, {
                label: 'dtmf',
                value: 'dtmf'
            }, {
                label: 'dialplan',
                value: 'dialplan'
            }, {
                label: 'reporting',
                value: 'reporting'
            }, {
                label: 'user',
                value: 'user'
            }, {
                label: 'security',
                value: 'security'
            }]
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getAmiList()
        this._getInitData()
    }
    _checkPermitNetMask0 = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const permitIP_0 = getFieldValue('permitIP_0')

        if (permitIP_0 && !value) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _checkPermit0 = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const permitNetmask_0 = getFieldValue('permitNetmask_0')

        if (permitNetmask_0 && !value) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _checkIfDefaultName = (rule, value, callback) => {
        var isDefault = true

        if (value === 'cgi' || value === 'pyuser') {
            isDefault = false
        }
        if (isDefault) {
            callback()
        } else {
            callback(formatMessage({id: "LANG3530"}))
        }
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.amiUserList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkPermitIPRequire = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        var num = rule.field.match(/\d+/)
        var permitNetmask = 'permitNetmask_' + num
        var val = getFieldValue(permitNetmask)
        const keys = getFieldValue('keys')

        if (val && !value) {
            callback(formatMessage({id: "LANG2150"}))
        } else if (!value && keys.length > 0) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _checkPermitNetMaskRequire = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        var num = rule.field.match(/\d+/)
        var permitIP = 'permitIP_' + num
        var val = getFieldValue(permitIP)
        const keys = getFieldValue('keys')

        if (val && !value) {
            callback(formatMessage({id: "LANG2150"}))
        } else if (!value && keys.length > 0) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _checkDifferentPermitIP = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const keys = getFieldValue('keys')
        let email_list = []
        let not_different = true
        if (rule.field !== 'permitIP_0') {
            const tmp_value = getFieldValue('permitIP_0')
            if (tmp_value === value) {
                not_different = false
            }
        }
        keys.map(function(item) {
            const field = `permitIP_${item}`
            if (rule.field !== field) {
                const tmp_value = getFieldValue(field)
                if (tmp_value === value) {
                    not_different = false
                }
            }
        })
        if (not_different === false) {
            callback(formatMessage({id: "LANG2816"}))
        } else {
            callback()
        }  
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getAmiList = () => {
        let amiUserList = this.state.amiUserList
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listAmiUser',
                options: 'user'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    let tmpuserList = res.response.user || {}

                    tmpuserList.map(function(item) {
                        amiUserList.push(item.user)
                    })
                    this.setState({
                        amiUserList: amiUserList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getInitData = () => {
        const userId = this.props.params.id
        const userName = this.props.params.name
        let userItem = {}
        let ipList = this.ipList || []
        let netmaskList = this.netmaskList || []
        let priList = this.state.priList || []
        let priAll = this.state.priAll
        let amiUserList = this.state.amiUserList || []

        if (userId) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getAmiUser',
                    user: userId
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        userItem = res.response.user || {}

                        let ipallList = userItem.permit ? userItem.permit.split(';') : []
                        for (let i = 0; i < ipallList.length; i++) {
                            let tmp = ipallList[i]
                            let tmpList = tmp.split('/')
                            ipList.push(tmpList[0])
                            netmaskList.push(tmpList[1])
                        }
                        if (ipallList.length >= 2) {
                            uuid = uuid + (ipallList.length - 1)
                        }
                        priList = userItem.pri.split(',')
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
            amiUserList = _.without(amiUserList, userId)
        }
        if (priList.length === this.state.plainOptions.length) {
            priAll = true
        }

        this.setState({
            userItem: userItem,
            ipList: ipList,
            netmaskList: netmaskList,
            priList: priList,
            priAll: priAll,
            amiUserList: amiUserList
        })
    }
    _removeIP = (k) => {
        const { form } = this.props
        // can use data-binding to get
        const keys = form.getFieldValue('keys')

        form.setFieldsValue({
            keys: keys.filter(key => key !== k)
        })
    }
    _addIP = () => {
        uuid++
        const { form } = this.props
        // can use data-binding to get
        const keys = form.getFieldValue('keys')
        const nextKeys = keys.concat(uuid)
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            keys: nextKeys
        })
    }
    _onChangePri = (checkedList) => {
        const plainOptions = this.state.plainOptions
        this.setState({
            priList: checkedList,
            priAll: checkedList.length === plainOptions.length
        })
    }
    _onChangePriAll = (e) => {
        const plainOptions = this.state.plainOptions
        let checkedList = []
        plainOptions.map(function(item) {
            checkedList.push(item.value)
        })
        this.setState({
            priList: e.target.checked ? checkedList : [],
            priAll: e.target.checked
        })
    }
    _handleCancel = () => {
        uuid = 1
        browserHistory.push('/value-added-features/ami')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const userId = this.props.params.id

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
                let priList = this.state.priList
                let ipList = []

                action.pri = priList.join(',')

                ipList.push(values.permitIP_0 + '/' + values.permitNetmask_0)
                const keys = getFieldValue('keys')
                keys.map((k, index) => {
                    let ip = `permitIP_${k}`
                    let netmask = `permitNetmask_${k}`
                    ipList.push(values[ip] + '/' + values[netmask])
                })
                action.permit = ipList.join(';')
                if (action.permit === '/') {
                    action.permit = ''
                }
                /* let i = 1
                if (i === 1) {
                    return false
                } */
                action["user"] = values.username
                action["secret"] = values.secret
                // action["pri"] = ""
                // action["permit"] = ""

                let needReboot = false
                if (userId) {
                    action.action = 'updateAmiUser'
                    action.user = userId
                    needReboot = true
                } else {
                    action.action = 'addAmiUser'
                    needReboot = false
                }

                if (priList.length === 0) {
                    message.destroy()
                    Modal.warning({
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {0: formatMessage({id: "LANG1069"})})}} ></span>,
                        okText: (formatMessage({id: "LANG727"}))
                    })
                } else {
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
                                if (needReboot) {
                                    Modal.confirm({
                                        content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG833"}) }}></span>,
                                        okText: formatMessage({id: 'LANG727'}),
                                        cancelText: formatMessage({id: 'LANG726'}),
                                        onOk: () => {
                                            UCMGUI.loginFunction.confirmReboot() 
                                        },
                                        onCancel: () => {
                                        }
                                    })
                                }
                            }

                            this._handleCancel()
                        }.bind(this)
                    })
                }
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue, getFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemIPLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }
        const formItemIPWithoutLabelLayout = {
            wrapperCol: { span: 18, offset: 3 }
        }
        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG3528"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG3528"}) }))

        const userItem = this.state.userItem || {}
        const priBox = this.state.priBox || {}
        const ipList = this.state.ipList || []
        const netmaskList = this.state.netmaskList || []
        const ipallList = this.state.ipallList || []

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        let keyList = []
        for (let k = 1; k < ipList.length; k++) {
            keyList.push(k)
        }

        getFieldDecorator('keys', { initialValue: keyList })
        const keys = getFieldValue('keys')
        const formIPItems = keys.map((k, index) => {
            return (
            <FormItem key={k}
                { ...formItemIPWithoutLabelLayout }
            >
                <Col span="8">
                    <FormItem>
                        {getFieldDecorator(`permitIP_${k}`, {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.ipAddress(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: this._checkDifferentPermitIP
                            }],
                            initialValue: ipList[k]
                            })(
                                <Input placeholder={ formatMessage({id: "LANG1915"}) } />
                        )}
                    </FormItem>
                </Col>
                <Col span="1">
                    <p className="ant-form-split">/</p>
                </Col>
                <Col span="8" style={{ marginRight: 10 }}>
                    <FormItem>
                        {getFieldDecorator(`permitNetmask_${k}`, {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.specialIpAddress(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: netmaskList[k]
                            })(
                                <Input placeholder={ formatMessage({id: "LANG1902"}) } />
                        )}
                    </FormItem>
                </Col>
                <Col span="1">
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        onClick={ () => this._removeIP(k) }
                    />
                </Col>
            </FormItem>
            )
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
                            ref="div_username"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG72" />}>
                                    <span>{formatMessage({id: "LANG72"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('username', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 8)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkName
                                }, {
                                    validator: this._checkIfDefaultName
                                }],
                                width: 100,
                                initialValue: this.props.params.name ? this.props.params.name : ""
                            })(
                                <Input maxLength="128" disabled={ this.props.params.id ? true : false } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_secret"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG73" />}>
                                    <span>{formatMessage({id: "LANG73"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('secret', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 6)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.keyboradNoSpacesemicolon(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.checkAlphanumericPw(data, value, callback, formatMessage)
                                    }
                                }],
                                width: 100,
                                initialValue: userItem.secret ? userItem.secret : ""
                            })(
                                <Input maxLength="128" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemIPLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3826" />}>
                                    <span>{formatMessage({id: "LANG2776"})}</span>
                                </Tooltip>
                            )}>
                            <Col span="8">
                                <FormItem>
                                    {getFieldDecorator("permitIP_0", {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: this._checkPermitIPRequire
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.ipAddress(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: this._checkDifferentPermitIP
                                        }],
                                        initialValue: ipList[0] ? ipList[0] : ""
                                        })(
                                            <Input placeholder={ formatMessage({id: "LANG1915"}) } />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span="1">
                                <p className="ant-form-split">/</p>
                            </Col>
                            <Col span="8" style={{ marginRight: 10 }}>
                                <FormItem>
                                    {getFieldDecorator("permitNetmask_0", {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: this._checkPermitNetMaskRequire
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.specialIpAddress(data, value, callback, formatMessage)
                                            }
                                        }],
                                        initialValue: netmaskList[0] ? netmaskList[0] : ""
                                        })(
                                            <Input placeholder={ formatMessage({id: "LANG1902"}) } />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span="1">
                                <Icon
                                    className="dynamic-plus-button"
                                    type="plus-circle-o"
                                    onClick={ this._addIP }
                                />
                            </Col>
                        </FormItem>
                        { formIPItems }
                        <FormItem
                            ref="div_all_pri_container"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3529" />}>
                                    <span>{formatMessage({id: "LANG2811"})}</span>
                                </Tooltip>
                            )}>
                            <Col span={ 2 }>
                                <Checkbox checked={ this.state.priAll } onChange={ this._onChangePriAll } />
                            </Col>
                            <Col span={ 6 }>{formatMessage({id: "LANG104"})}</Col>
                            <CheckboxGroup options={ this.state.plainOptions } value={ this.state.priList } onChange={ this._onChangePri } />
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(AMIItem))
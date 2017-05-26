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
import { Button, Checkbox, Col, Form, Input, message, Modal, Row, Select, Table, Tooltip, TreeSelect } from 'antd'

// import ZEROCONFIG from './parser/ZCDataSource'
// import { ZCCurConfig, ValueDelegationObj, PrepareSubmitConfigurations } from './parser/ZCController.jsx'

const FormItem = Form.Item
const Option = Select.Option

class GlobalTemplateItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            source: null,
            naviBox: null,
            templateInfo: {},
            globalTemplate: [],
            showPrepare: true,
            showContent: false,
            showOptions: false,
            templateName: this.props.params.name,
            currentMode: this.props.params.name ? 'edit' : 'add',
            currentTemplateId: this.props.params.id ? this.props.params.id : -1
        }
    }
    componentDidMount() {
        $(document).ready(() => {
            let BLL = window.BLL
            let ZEROCONFIG = window.ZEROCONFIG
            let { formatMessage } = this.props.intl

            ZEROCONFIG.init('', formatMessage, message)

            // ZCCurConfig.resetStatus()
            // ZCCurConfig.updatePageDOM('global-template', window, document)

            BLL.ConfigPage.resetStatus()
            BLL.ConfigPage.updatePageDOM('global-template', window, document)

            this._checkReady()
        })
    }
    componentWillUnmount() {
    }
    _checkReady = (mode, templateId) => {
        const { formatMessage } = this.props.intl

        let __this = this
        let BLL = window.BLL
        let ZEROCONFIG = window.ZEROCONFIG
        let currentMode = mode || this.state.currentMode
        let currentTemplateId = templateId || this.state.currentTemplateId

        if (ZEROCONFIG.isDataReady() === 1) {
            if (currentMode === 'edit' && currentTemplateId !== -1) {
                let processList = [],
                    processName = []

                processList.push(ZEROCONFIG.connector.getTemplate(currentTemplateId))
                processName.push('Item')

                processList.push(ZEROCONFIG.connector.getTemplateSettings(currentTemplateId))
                processName.push('Settings')

                $.when.apply({}, processList).done(function() {
                    let resultSet = arguments

                    if (processList.length === 1) {
                        resultSet = []
                        resultSet.push(arguments)
                    }

                    for (let i = 0; i < processList.length; i++) {
                        let result = resultSet[i][0]

                        if (result.status !== 0) {
                            // TODO: add error handling
                            console.error('Process error:' + processName[i])
                            return
                        } else {
                            if (processName[i] === 'Item') {
                                __this._setBasicInfo(result.response)
                            } else if (processName[i] === 'Settings') {
                                __this._setSettings(result.response)
                            }
                        }
                    }
                }).fail(() => {
                    console.log('FAIL', arguments)

                    message.error(formatMessage({id: "LANG3881"}))
                })

                this.setState({
                    showOptions: true
                })
            }

            this.setState({
                showContent: true,
                showPrepare: false
            })

            // TODO: checkZeroConfigInvalidModels
            // let source = $("#invalidModelWarning").html()
            // ZEROCONFIG.connector.checkZeroConfigInvalidModels(source, true)
        } else {
            let label = $('div#loadingMsgGTModal'),
                tLocale = 'LANG805'

            if (ZEROCONFIG.isDataReady() === -1) {
                tLocale = 'LANG3717'
            }

            label.text(formatMessage({id: tLocale}))

            setTimeout(this._checkReady, 1000)
        }
    }
    _checkTemplateName = (rule, value, callback) => {
        let ret = true
        let ZEROCONFIG = window.ZEROCONFIG
        let { formatMessage } = this.props.intl
        let currentTemplateId = this.state.currentTemplateId

        if (value) {
            ZEROCONFIG.connector.getTemplateByName(value, '')
                .done(function(data) {
                    if (data.status === 0 && data.response.body.length > 0) {
                        let templateId = data.response.body[0].id + ''

                        if (templateId !== currentTemplateId) {
                            ret = false
                        }
                    }
                })
                .fail(function() {})
        }

        if (value && !ret) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _handleCancel = (e) => {
        browserHistory.push('/value-added-features/zeroConfig/globalTemplates')
    }
    _handleSubmit = (e) => {
        // e.preventDefault()

        let __this = this
        let BLL = window.BLL
        let ZEROCONFIG = window.ZEROCONFIG
        let { formatMessage } = this.props.intl

        let source = this.state.source
        let currentMode = this.state.currentMode
        let currentTemplateId = this.state.currentTemplateId

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        let errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3391" })}}></span>

        if (this.state.showContent) {
            this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values)

                    message.loading(loadingMessage, 0)

                    let action = {}

                    action.name = values.name
                    action.desc = values.description
                    action.enabled = values.enabled ? 1 : 0
                    action.isDefault = 0 // false

                    if (currentMode === 'add') {
                        ZEROCONFIG.connector.updateTemplate(-1,
                                                action.name,
                                                null, // model id
                                                action.desc,
                                                action.enabled,
                                                action.isDefault)
                                .done((result) => {
                                    if (result.status === 0) {
                                        // needs to be executed before top dialog clear
                                        // mWindow.rebuildTable();

                                        // this response is super weird...
                                        let id = result.response.updateTemplate[0].id

                                        this.setState({
                                            currentMode: 'edit',
                                            templateName: action.name,
                                            currentTemplateId: id.toString()
                                        })

                                        this._checkReady('edit', id.toString())
                                        // this._handleUpdate(id, source, action)

                                        message.destroy()
                                    } else {
                                        // display error
                                    }
                                })
                                .fail(() => {
                                    message.destroy()
                                    message.error(formatMessage({id: "LANG862"}))

                                    console.error('PROCESS ERROR', arguments)
                                })
                    } else {
                        this._handleUpdate(currentTemplateId, source, action)
                    }
                }
            })
        }
    }
    _handleUpdate = (currentTemplateId, source, action) => {
        let __this = this
        let BLL = window.BLL
        let ZEROCONFIG = window.ZEROCONFIG
        let { formatMessage } = this.props.intl

        BLL.PrepareSubmitConfigurations(currentTemplateId, source, (result) => {
            if (result.error.length > 0) {
                // // TODO: come back to display error
                // // display error here
                // for (var i = 0; i < result.error.length; i++) {
                //     console.log(result.error[i]);
                // }
            } else {
                let processList = [],
                    processName = []

                ZEROCONFIG.connector.deleteAllTemplateSettings(currentTemplateId).done((ret) => {
                    if (ret.status !== 0) {
                        message.destroy()
                        message.error(formatMessage({id: "LANG862"}))

                        console.warn('FAIL: Unable to delete settings', ret)

                        return
                    }

                    processName.push('item')
                    processList.push(ZEROCONFIG.connector.updateTemplate(currentTemplateId,
                                                                         action.name,
                                                                         null, // model id
                                                                         action.desc,
                                                                         action.enabled,
                                                                         action.isDefault))

                    if (result.update.refId.length > 0) {
                        processName.push('update')
                        processList.push(ZEROCONFIG.connector.updateTemplateSettings(result.update.refId,
                                                                                     result.update.elementId,
                                                                                     result.update.elementNum,
                                                                                     result.update.entityName,
                                                                                     result.update.value))
                    }

                    $.when.apply({}, processList).done(function() {
                        let resultSet = arguments

                        if (processList.length === 1) {
                            resultSet = []
                            resultSet.push(arguments)
                        }

                        for (let i = 0; i < processName.length; i++) {
                            let result = resultSet[i][0]

                            if (result.status !== 0) {
                                UCMGUI.errorHandler(result, null, formatMessage)

                                console.error('Process error:' + processName[i])

                                return
                            }
                        }

                        message.destroy()
                        message.success(formatMessage({id: "LANG873"}))

                        __this._handleCancel()
                    }).fail(function() {
                        console.warn('FAIL', arguments)

                        message.destroy()
                        message.error(formatMessage({id: "LANG862"}))
                    })
                })
                .fail(function() {
                    console.warn('FAIL', arguments)

                    message.destroy()
                    message.error(formatMessage({id: "LANG862"}))
                })
            }
        })
    }
    _pageLoadCallback = (result) => {
        let naviBox = null
        let timers = new window.SimpleTimer()

        naviBox = $('div#navBar-inner div.combo').navibox({
                mode: 'select',
                deferred: timers,
                source: this.state.source,
                container: 'div#itemContainer'
            })

        timers.start(() => {
                // we need to prevent the use of ENTER as submit on input and select fields
                $('input, select', document).keypress(function(event) {
                    return event.keyCode !== 13
                })
            })

        $(window).scroll(function() {
            let navBar = $('#navBar')
            let navTop = $('#navTop')
            let navBarInner = $('#navBar-inner')

            if (navBar.length && navTop.length && navBarInner.length) {
                navBarInner.toggleClass('scrolling', $(window).scrollTop() > navBar.offset().top)

                // can be rewritten long form as:
                let scrollPosition, headerOffset, isScrolling

                headerOffset = navBar.offset().top
                scrollPosition = $(window).scrollTop()
                isScrolling = scrollPosition > headerOffset

                navBarInner.toggleClass('scrolling', isScrolling)

                if (isScrolling) {
                    navTop.show()
                } else {
                    navTop.hide()
                }
            }
        })

        this.setState({
            naviBox: naviBox
        })
    }
    _setBasicInfo = (data) => {
        const { formatMessage } = this.props.intl

        if (data && data.id && data.id.length > 0) {
            this.setState({
                templateInfo: data.id[0] || {}
            })
        } else {
            message.error(formatMessage({id: "LANG3881"}))
        }
    }
    _setSettings = (data) => {
        let ret = {}
        // let source = null
        let BLL = window.BLL
        let ZEROCONFIG = window.ZEROCONFIG

        const { formatMessage } = this.props.intl

        // TODO: this kind of return data needs to improve!
        if (data && data.template_id) {
            let currentData = data.template_id

            // NOTE: it is weird the return data is stored under object.template_id
            for (let i = 0; i < currentData.length; i++) {
                let item = currentData[i]
                let key = item.element_id + '#' + item.element_number

                if (!ret[key]) {
                    ret[key] = { 'values': {}, 'originName': '', 'originType': '' }
                }

                ret[key].values[item.entity_name] = item.value
            }
        } else {
            message.error(formatMessage({id: "LANG853"}))

            console.error('Fail to load data', data)
        }

        this.setState({
            source: BLL.DataCollection.generateGlobalBlockList(ret)
        })

        // source = BLL.DataCollection.generateGlobalBlockList(ret)
        ZEROCONFIG.valueDelegation.executeRequests(this._pageLoadCallback)
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const settings = this.state.templateInfo || {}
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 8 }
        }

        const title = (this.state.currentMode === 'edit'
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG3444"}),
                    1: this.state.templateName
                })
                : formatMessage({id: "LANG3446"}))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    isDisplay='display-block'
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                />
                <div
                    id="preparePadGTModal"
                    style={{ 'width': '500px', 'height': '160px' }}
                    className={ this.state.showPrepare ? 'display-block' : 'hidden' }
                >
                    <div style={{ 'marginTop': '60px' }}>
                        <img src="/../../images/ani_loading.gif" />
                    </div>
                    <div id="loadingMsgGTModal" style={{ 'textAlign': 'center' }}>{ formatMessage({ id: "LANG805"}) }</div>
                </div>
                <div className={ this.state.showContent ? 'content' : 'hidden' }>
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3449" /> }>
                                        <span>{ formatMessage({id: "LANG3449"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('name', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 64)
                                    }
                                }, {
                                    validator: this._checkTemplateName
                                }],
                                initialValue: settings.name
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3450" /> }>
                                        <span>{ formatMessage({id: "LANG3450"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('description', {
                                rules: [],
                                initialValue: settings.description
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3061" /> }>
                                        <span>{ formatMessage({id: "LANG3061"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('enabled', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: settings.enabled === 1
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <div
                            id="optionPadGTModal"
                            style={{ 'marginTop': '10px', 'minHeight': '300px' }}
                            className={ this.state.showOptions ? 'display-block' : 'hidden' }
                        >
                            <div id="navBar">
                                <div id="navBar-inner">
                                    <div className="cell label">{ formatMessage({ id: "LANG74"}) }</div>
                                    <div className="cell combo"></div>
                                    <div className="cell sideControl">
                                        <a id="navTop" href="#" title="Back to top" style={{ 'display': 'none' }}>
                                            <img src={ api.serverRoot + '/images/arrow_back_top.png' } />
                                        </a>
                                    </div>
                                </div>
                                <div style={{ 'clear': 'both' }}></div>
                            </div>
                            <div id="itemContainer" style={{ 'backgroundColor': '#efefef' }}></div>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

GlobalTemplateItem.propTypes = {}

export default Form.create()(injectIntl(GlobalTemplateItem))

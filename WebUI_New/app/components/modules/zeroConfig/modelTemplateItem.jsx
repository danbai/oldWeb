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

class ModelTemplateItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            source: null,
            naviBox: null,
            modelList: [],
            fieldIndex: 0,
            devmappings: [],
            templateInfo: {},
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
            // ZCCurConfig.updatePageDOM('model-template', window, document)

            BLL.ConfigPage.resetStatus()
            BLL.ConfigPage.updatePageDOM('model-template', window, document)

            this._checkReady()
        })
    }
    componentWillUnmount() {
    }
    _addCustomField = (name, value) => {
        let usingItem = null
        let naviBox = this.state.naviBox
        let fieldIndex = this.state.fieldIndex
        let devmappings = this.state.devmappings
        let { formatMessage } = this.props.intl
        let verifyName = function(name) {
                let found = devmappings[name]

                if (found && found.length > 0) {
                    tooltip.show()
                    usingItem = found[0]
                    possibleLink.attr('href', '#' + found[0]._uuid)

                    let labelValue = usingItem.label.toString()

                    if (labelValue.length > 1 && labelValue.lastIndexOf('@', 0) === 0) {
                        labelValue = formatMessage({id: labelValue.substring(1)})
                    }

                    possibleLink.attr('title', labelValue)
                } else {
                    tooltip.hide()
                }
            }

        let id = 'custom-field-' + (++fieldIndex)
        let mainContainer = $('<div/>').attr('id', id).addClass('row field')
        let controlContainer = $('<div />').addClass('cell').appendTo(mainContainer)
        let nameContainer = $('<div />').addClass('cell').appendTo(mainContainer)
        let valueContainer = $('<div />').addClass('cell').appendTo(mainContainer)
        let descContainer = $('<div />').addClass('cell').appendTo(mainContainer)
        let tooltip = $('<ucm-tooltip/>').addClass('warning not-remove').appendTo(descContainer).hide()

        $('<a/>')
            .addClass('remove')
            .attr('tabIndex', -1)
            .appendTo(controlContainer)
            .on('click', function(e) {
                mainContainer.remove()
            })

        let possibleLink = $('<a/>')
            .addClass('link')
            .attr('tabIndex', -1)
            .attr('locale', 'LANG3510')
            .text(formatMessage({id: 'LANG3510'}))
            .appendTo(tooltip)
            .on('click', function (e) {
                if (usingItem) {
                    let expendParent = function(item) {
                        if (item._parent) {
                            expendParent(item._parent)
                        } else if (item._widget && item._widget.expand) {
                            item._widget.expand()
                        }
                    }

                    expendParent(usingItem)

                    setTimeout(function() {
                        let widget = $('#' + usingItem._uuid)

                        if (widget.length > 0) {
                            let pos = widget.offset().top - 36

                            if (pos < 0) {
                                pos = 0
                            }

                            if (pos > $(document).height() - $(window).height()) {
                                pos = $(document).height() - $(window).height()
                            }

                            $(document.body).scrollTop(pos)

                            widget.effect('highlight', {}, 500)
                        } else {
                            naviBox.navibox('addItemByUUID', usingItem._uuid)
                        }
                    }, 0)
                }
            })

        $('<input/>')
            .attr('id', id + '-name')
            .addClass('name-field')
            .val(name ? name : "")
            .appendTo(nameContainer)
            .on('change', function(e) {
                let $this = $(this)
                let curValue = $this.val()

                verifyName(curValue)
            })

        $('<input/>')
            .attr('id', id + '-value')
            .addClass('value-field')
            .val(value ? value : '')
            .appendTo(valueContainer)

        $('div#fieldContainer').append(mainContainer)

        verifyName(name)

        this.setState({
            fieldIndex: fieldIndex
        })
    }
    _checkReady = (mode, templateId) => {
        const { formatMessage } = this.props.intl

        let __this = this
        let BLL = window.BLL
        let ZEROCONFIG = window.ZEROCONFIG
        let currentMode = mode || this.state.currentMode
        let currentTemplateId = templateId || this.state.currentTemplateId

        if (ZEROCONFIG.isDataReady() === 1) {
            // needs to prepare global list
            BLL.DataCollection.prepareGlobalList()

            ZEROCONFIG.ValueMonitor.init()

            let modelList = BLL.DataCollection.generateBasicModelList()

            this.setState({
                showContent: true,
                showPrepare: false,
                modelList: modelList
            })

            if (currentMode === 'edit' && currentTemplateId !== -1) {
                let processList = [],
                    processName = []

                processList.push(ZEROCONFIG.connector.getTemplate(currentTemplateId))
                processName.push('Item')

                processList.push(ZEROCONFIG.connector.getModelTemplateSettings(currentTemplateId))
                processName.push('Settings')

                processList.push(ZEROCONFIG.connector.getModelTemplateCustomSettings(currentTemplateId))
                processName.push('CustomFields')

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
                            message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG853" })}}></span>)

                            console.error('Fail to load data', result)
                            return
                        } else {
                            if (processName[i] === 'Item') {
                                __this._setBasicInfo(result.response)
                            } else if (processName[i] === 'Settings') {
                                __this._setSettings(result.response)
                            } else if (processName[i] === 'CustomFields') {
                                __this._setCustomFields(result.response)
                            }
                        }
                    }
                }).fail(() => {
                    console.log('FAIL', arguments)

                    message.error(formatMessage({id: "LANG862"}))
                })

                this.setState({
                    showOptions: true
                })
            }
        } else {
            let label = $('div#loadingMsgMTModal'),
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
        let form = this.props.form
        let ZEROCONFIG = window.ZEROCONFIG
        let { formatMessage } = this.props.intl
        let modelID = form.getFieldValue('model_id')
        let currentTemplateId = this.state.currentTemplateId

        if (value) {
            ZEROCONFIG.connector.getTemplateByName(value, modelID)
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
        browserHistory.push('/value-added-features/zeroConfig/modelTemplates')
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
                    action.model = values.model_id
                    action.desc = values.description
                    action.enabled = values.enabled ? 1 : 0
                    action.isDefault = values.is_default ? 1 : 0

                    if (currentMode === 'add') {
                        ZEROCONFIG.connector.updateTemplate(-1,
                                                action.name,
                                                action.model,
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

                processName.push('deleteSettings')
                processList.push(ZEROCONFIG.connector.deleteAllModelTemplateSettings(currentTemplateId))

                processName.push('deleteCustomSettings')
                processList.push(ZEROCONFIG.connector.deleteAllModelTemplateCustomSettings(currentTemplateId))

                $.when.apply({}, processList).done(function() {
                    let resultSet = arguments

                    if (processList.length === 1) {
                        resultSet = []
                        resultSet.push(arguments)
                    }

                    for (let i = 0; i < processName.length; i++) {
                        let result = resultSet[i][0]

                        if (result.status !== 0) {
                            message.destroy()
                            message.error(formatMessage({id: "LANG862"}))

                            console.error('Process error:' + processName[i])

                            return
                        }
                    }

                    processName = []
                    processList = []

                    processName.push('item')
                    processList.push(ZEROCONFIG.connector.updateTemplate(currentTemplateId,
                                                                        action.name,
                                                                        action.model,
                                                                        action.desc,
                                                                        action.enabled,
                                                                        action.isDefault))

                    // [AH] START custom fields
                    let mainContainer = $('div#fieldContainer')
                    let customFields = {}
                    let outputCustomFields = {
                            refid: [],
                            name: [],
                            value: []
                        }

                    $('div.row.field', mainContainer).each(function(index, item) {
                        let $item = $(item)
                        let nameField = $('input.name-field', $item).val()
                        let valueField = $('input.value-field', $item).val()

                        if (nameField) {
                            customFields[nameField] = valueField
                        }
                    })

                    for (let name in customFields) {
                        if (customFields.hasOwnProperty(name)) {
                            let usingVal = UCMGUI.urlFunction.escape(customFields[name])

                            outputCustomFields.refid.push(currentTemplateId)
                            outputCustomFields.name.push(name)
                            outputCustomFields.value.push(usingVal)
                        }
                    }

                    if (outputCustomFields.name.length > 0) {
                        processName.push('insertCustom')
                        processList.push(ZEROCONFIG.connector.updateModelTemplateCustomSettings(outputCustomFields.refid,
                                                                                                outputCustomFields.name,
                                                                                                outputCustomFields.value))
                    }
                    // [AH] END custom fields

                    if (result.update.refId.length > 0) {
                        processName.push('update')
                        processList.push(ZEROCONFIG.connector.updateModelTemplateSettings(result.update.refId,
                                                                                          result.update.elementId,  // this is actually field ids
                                                                                          result.update.entityName,
                                                                                          result.update.value))
                    }

                    // process
                    $.when.apply({}, processList).done(function() {
                        let resultSet = arguments

                        if (processList.length === 1) {
                            resultSet = []
                            resultSet.push(arguments)
                        }

                        for (let i = 0; i < processName.length; i++) {
                            let r = resultSet[i][0]

                            if (r.status !== 0) {
                                console.error('Process error:' + processName[i])

                                UCMGUI.errorHandler(result, null, formatMessage)

                                return
                            }
                        }

                        message.destroy()
                        message.success(formatMessage({id: "LANG873"}))

                        __this._handleCancel()
                    }).fail(function () {
                        console.warn('FAIL', arguments)

                        message.destroy()
                        message.error(formatMessage({id: "LANG862"}))
                    })
                }).fail(function() {
                    console.warn('FAIL', arguments)

                    message.destroy()
                    message.error(formatMessage({id: "LANG862"}))
                })
            }
        })
    }
    _onChangeModel = (value) => {
        let BLL = window.BLL

        this._onChangeModelThumbnail(BLL.DataCollection.getModel(value))
    }
    _onChangeModelThumbnail = (model) => {
        let BLL = window.BLL
        let thumbnail = $('div.thumbnail')

        thumbnail.empty()

        let img = new Image()
        let modelInfo = model

        img.onload = function() {
            thumbnail[0].appendChild(img)

            let imageItems = []
            let imageList = modelInfo.imageMappings()

            for (let name in imageList) {
                if (imageList.hasOwnProperty(name)) {
                    let newMapItem = {}
                    let imgMap = imageList[name]
                    let regions = imgMap.getRegions()

                    newMapItem.src = modelInfo.resourcePath() + imgMap.getPath()
                    newMapItem.verticalFit = false
                    newMapItem.map = []

                    for (let rname in regions) {
                        if (regions.hasOwnProperty(rname)) {
                            let region = regions[rname]
                            let link = region.getLink(BLL.ConfigPage.mode())

                            if (link) {
                                newMapItem.map.push({
                                    'coords': region.toCoords(),
                                    'ref': link.getFullPath()
                                })
                            }
                        }
                    }

                    imageItems.push(newMapItem)
                }
            }

            if (imageItems.length > 0) {
                let zoom = $('<div/>')
                            .addClass('zoon-glass')
                            .appendTo(thumbnail)

                zoom.magnificPopup({
                    type: 'mapimage',
                    items: imageItems,
                    verticalFit: false,
                    closeBtnInside: false,
                    gallery: {
                        enabled: true,
                        navigateByImgClick: false
                    },
                    callbacks: {
                        mapclick: function(sender) {
                            let $sender = $(sender)
                            let ref = $sender.attr('ref')

                            if (ref) {
                                let found = $('[path="' + ref + '"]')

                                if (found.length > 0) {
                                    window.location.hash = '' // clear existing hash
                                    window.location.hash = '#' + found.attr('id')

                                    $.magnificPopup.close()
                                }
                            }
                        }
                    }
                })
            }
        }

        img.onerror = function() {
            img = null

            thumbnail.append($('<img/>').attr({ 'width': '170px', 'height': '170px', 'src': api.serverRoot + '/images/empty.png', 'class': 'thumbnail' }).addClass(thumbnail))
        }

        img.className = 'thumbnail'
        img.setAttribute('style', 'width: 170px; height: 170px')

        if (model) {
            img.src = model.resourcePath() + model.thumbnail()
        } else {
            img.src = api.serverRoot + '/images/empty.png'
        }
    }
    _pageLoadCallback = (result) => {
        let naviBox = null
        let ZEROCONFIG = window.ZEROCONFIG
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

                ZEROCONFIG.ValueMonitor.sync()
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
        let BLL = window.BLL
        const { formatMessage } = this.props.intl

        if (data && data.id && data.id.length > 0) {
            let item = data.id[0] || {}

            this.setState({
                templateInfo: item
            })

            BLL.ConfigPage.updatePageConfig(item.model_id, 'template', item)

            if (BLL.ConfigPage.modelInfo()) {
                BLL.ConfigPage.modelInfo().prepareListData()
            }
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
                let key = item.field_id

                if (!ret[key]) {
                    ret[key] = { 'values': {}, 'originName': '', 'originType': '' }
                }

                ret[key].values[item.entity_name] = item.value
            }
        } else {
            // message.error(formatMessage({id: "LANG853"}))

            console.error('Unable to retrieve the data for this page.')
        }

        let model = BLL.ConfigPage.modelInfo()

        if (model) {
            let using = model.generateFieldList(ret)

            this._onChangeModelThumbnail(model)

            this.setState({
                source: using.source,
                devmappings: using.devmapping
            })

            ZEROCONFIG.valueDelegation.executeRequests(this._pageLoadCallback)
        } else {
            // TODO: add error handling
            console.error('INVALID Model')
        }
    }
    _setCustomFields = (data) => {
        const { formatMessage } = this.props.intl

        if (data && data.template_id) {
            let currentData = data.template_id

            for (let i = 0; i < currentData.length; i++) {
                let item = currentData[i]

                this._addCustomField(item.devname, item.value)
            }
        } else {
            console.warn('Unable to retrieve the custom fields for this page.')
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const settings = this.state.templateInfo || {}
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 8 }
        }

        const title = (this.state.currentMode === 'edit'
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG3445"}),
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
                    id="preparePadMTModal"
                    style={{ 'width': '500px', 'height': '160px' }}
                    className={ this.state.showPrepare ? 'display-block' : 'hidden' }
                >
                    <div style={{ 'marginTop': '60px' }}>
                        <img src="/../../images/ani_loading.gif" />
                    </div>
                    <div id="loadingMsgMTModal" style={{ 'textAlign': 'center' }}>{ formatMessage({ id: "LANG805"}) }</div>
                </div>
                <div className={ this.state.showContent ? 'content' : 'hidden' }>
                    <Form>
                        <Row>
                            <Col span={ 5 }>
                                <div className="cell thumbnail">
                                    <img id="thumbnail" src={ api.serverRoot + '/images/empty.png' } style={{ 'width': '170px', 'height': '170px' }} />
                                </div>
                            </Col>
                            <Col span={ 19 }>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <span>
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3461" /> }>
                                                <span>{ formatMessage({id: "LANG3461"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('model_id', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        initialValue: settings.model_id ? settings.model_id + '' : ''
                                    })(
                                        <Select
                                            onChange={ this._onChangeModel }
                                            disabled={ this.state.currentMode === 'edit' }
                                        >
                                            {
                                                this.state.modelList.map((item) => {
                                                    return <Option
                                                                key={ item.id }
                                                                value={ item.id + '' }
                                                            >
                                                                { (item.vendor + ' ' + item.name).toUpperCase() }
                                                            </Option>
                                                })
                                            }
                                        </Select>
                                    ) }
                                </FormItem>
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
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG3462" /> }>
                                                <span>{ formatMessage({id: "LANG3462"}) }</span>
                                            </Tooltip>
                                        </span>
                                    )}
                                >
                                    { getFieldDecorator('is_default', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: settings.is_default === 1
                                    })(
                                        <Checkbox />
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
                            </Col>
                        </Row>
                        <div
                            id="optionPadMTModal"
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
                            <div id="customContainer">
                                <div className="section-head">
                                    <span className="label">{ formatMessage({ id: "LANG3483"}) }</span>
                                </div>
                                <div id="fieldContainer">
                                    <div className="row head">
                                        <div className="cell control">&nbsp;</div>
                                        <div className="cell name">
                                            <span>{ formatMessage({ id: "LANG135"}) }</span>
                                        </div>
                                        <div className="cell value">
                                            <span>{ formatMessage({ id: "LANG3485"}) }</span>
                                        </div>
                                        <div className="cell desc" style={{ 'width': 'auto' }}>&nbsp;</div>
                                    </div>
                                </div>
                                <div className="section-content" style={{ 'marginTop': '8px' }}>
                                    <div
                                        id="btnAddNewField"
                                        className="controlButton"
                                        style={{ 'marginLeft': '40px' }}
                                        onClick={ this._addCustomField.bind(this, '', '') }
                                    >
                                        <span className="icon add">&nbsp;</span>
                                        <span className="label">{ formatMessage({ id: "LANG3484"}) }</span>
                                    </div>
                                </div>
                            </div>
                            <div id="itemContainer" style={{ 'backgroundColor': '#efefef' }}></div>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

ModelTemplateItem.propTypes = {}

export default Form.create()(injectIntl(ModelTemplateItem))

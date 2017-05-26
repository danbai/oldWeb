'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Tabs } from 'antd'

const FormItem = Form.Item
// import ZEROCONFIG from './parser/ZCDataSource'
// import BLL from './parser/ZCNss.jsx'
// import { ZCCurConfig, ValueDelegationObj, PrepareSubmitConfigurations } from './parser/ZCController.jsx'
// import NaviBox from './widgets/naviBox.jsx'

class GlobalPolicy extends Component {
    constructor(props) {
        super(props)

        this.state = {
            source: null,
            naviBox: null,
            templateId: 0,
            globalPolicy: [],
            showPrepare: true,
            showContent: false
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        $(document).ready(() => {
            let BLL = window.BLL
            let ZEROCONFIG = window.ZEROCONFIG
            let { formatMessage } = this.props.intl
            if (!window.ISREFRESHPAGE) {
                ZEROCONFIG.init("", formatMessage, message)
                ZEROCONFIG.init('', formatMessage, message)
                BLL.ConfigPage.resetStatus()
                BLL.ConfigPage.updatePageDOM('globalpolicy', window, document)

                this._checkReady()
            } else {
                setTimeout(() => {
                    window.ZEROCONFIG.init("", formatMessage, message)
                    ZEROCONFIG.init('', formatMessage, message)
                    BLL.ConfigPage.resetStatus()
                    BLL.ConfigPage.updatePageDOM('globalpolicy', window, document)

                    this._checkReady()
                }, 600)
            }
        })
    }
    _checkReady = () => {
        const { formatMessage } = this.props.intl

        let self = this
        let BLL = window.BLL
        let ZEROCONFIG = window.ZEROCONFIG

        if (ZEROCONFIG.isDataReady() === 1) {
            BLL.DataCollection.prepareGlobalList()

            ZEROCONFIG.connector.getTemplateSettings(this.state.templateId)
                .done((result) => {
                    setTimeout(() => {
                        this._pageValueLoadedCallback(result)
                    }, 1)
                }).fail(function() {
                    // TODO: add error display here
                    console.error('FAIL', arguments)
                })

            ZEROCONFIG.connector.checkZeroConfigInvalidModels($('#invalidModelWarning').html(), true)

            this.setState({
                showContent: true,
                showPrepare: false
            })
        } else {
            let label = $('div#loadingMsgGP'),
                tLocale = 'LANG805'

            if (ZEROCONFIG.isDataReady() === -1) {
                tLocale = 'LANG3717'
            }

            label.text(formatMessage({id: tLocale}))

            setTimeout(this._checkReady, 1000)
        }
    }
    _handleSubmit = () => {
        let __this = this
        let BLL = window.BLL
        let ZEROCONFIG = window.ZEROCONFIG
        let source = this.state.source
        let templateId = this.state.templateId
        let { formatMessage } = this.props.intl

        BLL.PrepareSubmitConfigurations(templateId, source, (result) => {
            if (result.error.length > 0) {
                // display error here
                // for (let i = 0; i < result.error.length; i++) {
                //    console.log(result.error[i])
                // }
            } else {
                let processList = [],
                    listName = []

                message.loading(formatMessage({ id: "LANG978"}), 0)

                // process delete ALL settings first
                ZEROCONFIG.connector.deleteAllTemplateSettings(templateId).done((ret) => {
                    if (ret.status !== 0) {
                        message.destroy()
                        message.error(formatMessage({ id: "LANG862"}))

                        console.warn('FAIL: Unable to delete settings', ret)

                        return
                    }

                    if (result.update.refId.length > 0) {
                        listName.push('update')
                        processList.push(ZEROCONFIG.connector.updateTemplateSettings(result.update.refId,
                                                                              result.update.elementId,
                                                                              result.update.elementNum,
                                                                              result.update.entityName,
                                                                              result.update.value))

                        $.when.apply({}, processList).done(function() {
                            let resultSet = arguments

                            if (processList.length === 1) {
                                resultSet = []
                                resultSet.push(arguments)
                            }

                            for (let i = 0; i < listName.length; i++) {
                                let result = resultSet[i][0]

                                if (result.status !== 0) {
                                    console.error('Process error:' + listName[i])

                                    message.error(formatMessage({ id: "LANG862"}))

                                    return
                                }
                            }

                            message.destroy()
                            message.success(formatMessage({ id: "LANG873"}))
                        }).fail(function() {
                            message.destroy()
                            message.error(formatMessage({ id: "LANG862"}))

                            console.log('FAIL', arguments)
                        })
                    } else {
                        message.destroy()
                        message.success(formatMessage({ id: "LANG873"}))
                    }
                })
                .fail(function () {
                    message.destroy()
                    message.error(formatMessage({ id: "LANG862"}))
                })
            }
        })
    }
    _pageValueLoadedCallback = (result) => {
        const { formatMessage } = this.props.intl

        let data = {}
        let BLL = window.BLL
        let ZEROCONFIG = window.ZEROCONFIG

        if (result.status === 0) {
            // NOTE: it is weird the return data is stored under object.template_id
            for (let i = 0; i < result.response.template_id.length; i++) {
                let item = result.response.template_id[i]
                let key = item.element_id + '#' + item.element_number

                if (!data[key]) {
                    data[key] = { 'values': {}, 'originName': '', 'originType': '' }
                }

                data[key].values[item.entity_name] = item.value
            }
        } else {
            message.error(formatMessage({ id: "LANG853"}))

            console.error('Fail to load data', result)
        }

        this.setState({
            source: BLL.DataCollection.generateGlobalBlockList(data)
        })

        ZEROCONFIG.valueDelegation.executeRequests(this._pageLoadCallback)
    }
    _pageLoadCallback = (result) => {
        let naviBox = null
        let timers = new window.SimpleTimer()

        naviBox = $('div#navBar-inner div.combo').navibox({
                mode: 'all',
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
    render() {
        const {formatMessage} = this.props.intl
        const globalPolicy = this.state.globalPolicy
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        // const title = formatMessage({id: "LANG632"})

        // document.title = formatMessage({id: "LANG584"}, {
        //     0: model_info.model_name,
        //     1: title
        // })

        return (
            <div className="app-content-main" id="app-content-main">
                {/* <Title
                    headerTitle=""
                    isDisplay='display-block'
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                />
                <div>
                    <NaviBox
                        mode="all"
                        deferred={ null }
                        source={ globalPolicy }
                    />
                </div> */}
                <div
                    id="preparePadGP"
                    style={{ 'width': '500px', 'height': '160px' }}
                    className={ this.state.showPrepare ? 'display-block' : 'hidden' }
                >
                    <div style={{ 'marginTop': '60px' }}>
                        <img src="/../../images/ani_loading.gif" />
                    </div>
                    <div id="loadingMsgGP" style={{ 'textAlign': 'center' }}>{ formatMessage({ id: "LANG805"}) }</div>
                </div>
                <div className={ this.state.showContent ? 'content' : 'hidden' }>
                    <Form>
                        <div id="contentPad" style={{ width: "720px" }}>
                            <div className="lite-desc">
                                <span>{ formatMessage({ id: "LANG3542" }) }</span>
                            </div>
                            <div id="navBar">
                                <div id="navBar-inner">
                                    {/* Note #1 */}
                                    <div className="cell label">{ formatMessage({ id: "LANG74" }) }</div>
                                    <div className="cell combo"></div>
                                    <div className="cell sideControl">
                                        <a id="navTop" href="#" title="Back to top" style={{ 'display': 'none' }}>
                                            <img src={ api.serverRoot + '/images/arrow_back_top.png' } />
                                        </a>
                                    </div>
                                </div>
                                <div style={{ clear: "both" }}></div>
                            </div>
                            <div id="itemContainer"></div>
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <Button type="primary" onClick={ this._handleSubmit } className="save">
                                    { formatMessage({id: "LANG728"}) }
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

GlobalPolicy.propTypes = {
}

export default Form.create()(injectIntl(GlobalPolicy))

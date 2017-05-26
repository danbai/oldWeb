'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import Language from './language'
import VoicePrompt from './voicePrompt'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { Form, Input, Tabs, message } from 'antd'
const TabPane = Tabs.TabPane
import _ from 'underscore'

class Prompt extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: this.props.params.id ? this.props.params.id : '1',
            isDisplay: this.props.params.id === '2' ? 'hidden' : 'display-block',
            language: 'en'
        }
    }
    componentDidMount() {
        this._getLanguageSettings()
    }
    componentWillUnmount() {

    }
    _onChange = (e) => {
        if (e === "1") {
            this.setState({
                activeKey: e,
                isDisplay: "display-block"
            })
        } else {
            this.setState({
                activeKey: e,
                isDisplay: "hidden"
            })
        }
    }
    _getLanguageSettings = () => {
        const { formatMessage } = this.props.intl

        let languageList = []
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getLanguage' },
            type: 'json',
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    languageList = response.languages
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getLanguageSettings' },
            type: 'json',
            // async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    const language = response.language_settings.language

                    let has_language = false
                    languageList.map(function(item) {
                        if (item.language_id === language) {
                            has_language = true
                        }
                    })
                    if (has_language) {
                        this.setState({
                            language: language
                        })
                        this.props.form.setFieldsValue({
                            'language': language
                        })
                    } else {
                        this.setState({
                            language: 'en'
                        })
                        this.props.form.setFieldsValue({
                            'language': 'en'
                        })
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
            }

            message.loading(formatMessage({ id: "LANG826" }), 0)

            let action = {}

            action.action = "updateLanguageSettings"
            action.language = values.language

            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: action,
                type: 'json',
                // async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        message.destroy()
                        message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                        this.setState({
                            language: values.language
                        })
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        })
    }
    _handleCancel = () => {
        this._getLanguageSettings()
        this.props.form.resetFiedls()
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG4752"})
                })

        return (
            <div className="app-content-main" id="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG4752"}) } 
                    onSubmit={ this._handleSubmit.bind(this) } 
                    onCancel={ this._handleCancel } 
                    isDisplay={ this.state.isDisplay }
                />
                <Tabs
                    defaultActiveKey={ this.state.activeKey }
                    onChange={this._onChange}
                    animated={ UCMGUI.initConfig.msie ? false : true }
                >
                    <TabPane tab={formatMessage({id: "LANG689"})} key="1">
                        <Language 
                            form={ this.props.form }
                            language={ this.state.language }
                            getLanguageSettings={this._getLanguageSettings}
                        />
                    </TabPane>
                    <TabPane tab={formatMessage({id: "LANG28"})} key="2">
                        <VoicePrompt />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

Prompt.propTypes = {
}

export default Form.create()(injectIntl(Prompt))
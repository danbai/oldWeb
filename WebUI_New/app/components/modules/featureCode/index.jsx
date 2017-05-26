'use strict'

import React, { Component, PropTypes } from 'react'
import { message, Tabs, Form } from 'antd'
import { FormattedMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import FeatureMap from './FeatureMap'
import CallForward from './CallForward'
import FeatureMisc from './FeatureMisc'
import FeatureCodes from './FeatureCodes'
import Title from '../../../views/title'
import _ from 'underscore'
import { browserHistory } from 'react-router'

const TabPane = Tabs.TabPane

class FeatureCode extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: "1",
            featureCodes: {},
            featureMaps: {},
            featureSettings: {},
            numberList: [],
            numberListWithoutFCodes: [],
            extenPrefSettings: {}
        }
    }
    componentWillMount () {
        this._getInitData()
        this._getExtenPrefSettings()
    }
    _getInitData = () => {
        var featureCodes = {},
            featureMaps = {},
            featureSettings = {}
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getFeatureCodes'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                featureCodes = data.response.feature_codes
                featureMaps = data.response.feature_maps
                featureSettings = data.response.feature_settings
            }.bind(this)
        })
        let numberList = UCMGUI.isExist.getList("getNumberList")
        let numberListWithoutFCodes = _.clone(numberList)
        for (var id in featureCodes) {
            if (featureCodes.hasOwnProperty(id)) {
                numberListWithoutFCodes = _.without(numberListWithoutFCodes, featureCodes[id])
            }
        }

        this.setState({
            featureCodes: featureCodes,
            featureMaps: featureMaps,
            featureSettings: featureSettings,
            numberList: numberList,
            numberListWithoutFCodes: numberListWithoutFCodes
        })
    }
    _getExtenPrefSettings = () => {
        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                action: "getExtenPrefSettings"
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data)

                if (bool) {
                    const extenPrefSettings = data.response.extension_pref_settings
                    this.setState({
                        extenPrefSettings: extenPrefSettings
                    })
                }
            }.bind(this)
        })
    }
    _handleCancel = () => {
        this.props.form.resetFields()
        this._getInitData()
        this._getExtenPrefSettings()
        // browserHistory.push('/call-features/featureCode')
    }
    _handleSaveFeatures = (action, successMessage) => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: action,
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)
                }
            }.bind(this)
        })
    }
    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const extensionId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = {},
                    inbound_mode = values.inbound_mode

                action.action = 'updateFeatureCodes'

                _.map(values, function(value, key) {
                    if (key === 'inbound_mode') {
                        return true
                    }

                    if (key.match(/enable/) || key === 'park_as_extension') {
                        value = value ? 'yes' : 'no'
                    }

                    action[key] = value ? value : ''
                })

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            if (!action.enable_inboud_multi_mode) {
                                $.ajax({
                                    url: api.apiHost,
                                    method: "post",
                                    data: {
                                        action: 'updateInboundMode',
                                        inbound_mode: 0
                                    },
                                    type: 'json',
                                    error: function(e) {
                                        message.error(e.statusText)
                                    },
                                    success: function(data) {
                                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                        if (bool) {
                                            message.destroy()
                                            message.success(successMessage)
                                        }
                                    }.bind(this)
                                })
                            } else {
                                $.ajax({
                                    url: api.apiHost,
                                    method: "post",
                                    data: {
                                        action: 'updateInboundMode',
                                        inbound_mode: inbound_mode
                                    },
                                    type: 'json',
                                    error: function(e) {
                                        message.error(e.statusText)
                                    },
                                    success: function(data) {
                                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                        if (bool) {
                                            message.destroy()
                                            message.success(successMessage)
                                        }
                                    }.bind(this)
                                })
                            }
                        }
                    }.bind(this)
                })
            }
        })
    }
    _onChange = (activeKey) => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                this.setState({ 
                    activeKey: this.state.activeKey
                })
                return
            }

            this.setState({
                activeKey
            })
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 
            1: formatMessage({id: "LANG26"})
        })

        return (
            <div className="app-content-main">
                <Title 
                    headerTitle={ formatMessage({id: "LANG26"}) }  
                    onSubmit={ this._handleSubmit } 
                    onCancel={ this._handleCancel } 
                    isDisplay='display-block' /> 
                <Form className="form-contain-tab">
                    <Tabs
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChange }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={formatMessage({id: "LANG612"})} key="1">
                            <FeatureMap
                                dataSource={ this.state.featureMaps }
                                form={ form }/>
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG611"})} key="2">
                            <CallForward
                                dataSource={ this.state.featureCodes }
                                featureCodes={ this.state.featureCodes }
                                numberList={this.state.numberList}
                                numberListWithoutFCodes={this.state.numberListWithoutFCodes}
                                featureSettings={ this.state.featureSettings }
                                form={ form }/>
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG613"})} key="3">
                            <FeatureMisc
                                dataSource={ this.state.featureSettings }
                                featureCodes={this.state.featureCodes}
                                extenPrefSettings={this.state.extenPrefSettings}
                                numberList={this.state.numberList}
                                numberListWithoutFCodes={this.state.numberListWithoutFCodes}
                                form={ form }/>
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG610"})} key="4">
                            <FeatureCodes
                                dataSource={ this.state.featureCodes }
                                featureCodes={ this.state.featureCodes }
                                numberList={this.state.numberList}
                                numberListWithoutFCodes={this.state.numberListWithoutFCodes}
                                featureSettings={ this.state.featureSettings }
                                form={ form }/>
                        </TabPane>
                    </Tabs>
                </Form>
            </div>
        )
    }
}

export default Form.create()(injectIntl(FeatureCode))
'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, Checkbox, Form, Input, message, Select, Tabs } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import VoicemailSettings from './voicemailSettings'
import VoicemailGroupSettings from './voicemailGroupSettings'

const FormItem = Form.Item
const Option = Select.Option
const TabPane = Tabs.TabPane

class VoicemailAll extends Component {
    constructor(props) {
        super(props)
        this.state = {
            operator: false,
            accountList: [],
            prefSettings: {},
            voicemailSettings: {},
            isDisplay: "display-block",
            activeKey: this.props.params.id ? this.props.params.id : '1'
        }
    }
    componentDidMount() {
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
    _handleCancel = () => {
        browserHistory.push('/call-features/voicemail')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = values

                action.action = 'updateVMSettings'
                action.en_reverse = (action.en_reverse ? 'yes' : 'no')
                action.envelope = (action.envelope ? 'yes' : 'no')
                action.operator = (action.operator ? 'yes' : 'no')
                action.review = (action.review ? 'yes' : 'no')
                action.saycid = (action.saycid ? 'yes' : 'no')
                action.sayduration = (action.sayduration ? 'yes' : 'no')

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
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                        }
                    }.bind(this)
                })
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        document.title = formatMessage({id: "LANG584"}, {
            0: model_info.model_name,
            1: formatMessage({id: "LANG651"})
        })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG651"}) }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay={ this.state.isDisplay }
                />
                <Tabs
                    defaultActiveKey={ this.state.activeKey }
                    onChange={this._onChange}
                    animated={ UCMGUI.initConfig.msie ? false : true }
                >
                    <TabPane tab={formatMessage({id: "LANG20"})} key="1">
                        <VoicemailSettings form={ this.props.form } />
                    </TabPane>
                    <TabPane tab={formatMessage({id: "LANG21"})} key="2">
                        <VoicemailGroupSettings />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

export default Form.create()(injectIntl(VoicemailAll))
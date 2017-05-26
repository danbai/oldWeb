'use strict'

import {injectIntl} from 'react-intl'
import UserManagement from './userManagement'
import CustomPrivilege from './customPrivilege'
import { Form, Input, Tabs, message } from 'antd'
import React, { Component, PropTypes } from 'react'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

const TabPane = Tabs.TabPane

class UserManage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            userLoad: false,
            customLoad: false,
            isDisplay: "display-block",
            activeKey: this.props.params.tab ? this.props.params.tab : 'user'
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {

    }
    _onChange = (e) => {
        if (e === "1") {
            this.setState({
                activeKey: e,
                isDisplay: "display-block",
                userLoad: true,
                customLoad: false
            })
        } else {
            this.setState({
                activeKey: e,
                isDisplay: "hidden",
                userLoad: false,
                customLoad: true
            })
        }
    }
    _setFirstLoad = (module, key) => {
        if (module === 'custom') {
            this.setState({
                customLoad: key
            })
        } else if (module === 'user') {
            this.setState({
                userLoad: key
            })
        }
    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
            }

            message.loading(formatMessage({ id: "LANG826" }), 0)

            let action = {}

            for (let item in values) {
                if (values[item]) {
                    action[item] = values[item]
                }
            }

            action.smtp_tls_enable = action.smtp_tls_enable ? 'yes' : 'no'
            action["action"] = "updateEmailSettings"

            $.ajax({
                data: action,
                type: 'post',
                url: api.apiHost,
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
        })
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
                    1: formatMessage({id: "LANG3859"})
                })

        let content = '',
            role = localStorage.getItem('role')

        if (role === 'privilege_0') {
             content = <Tabs
                        onChange={ this._onChange }
                        defaultActiveKey={ this.state.activeKey }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG2802"}) } key="user">
                            <UserManagement 
                                firstLoad={ this.state.userLoad }
                                setFirstLoad={ this._setFirstLoad }
                            />
                        </TabPane>
                        <TabPane
                            tab={formatMessage({id: "LANG5167"})}
                            key="privilege" 
                        >
                            <CustomPrivilege
                                firstLoad={this.state.customLoad}
                                setFirstLoad={this._setFirstLoad}
                            />
                        </TabPane>
                    </Tabs>
        } else {
            content = <UserManagement 
                        firstLoad={ this.state.userLoad }
                        setFirstLoad={ this._setFirstLoad }
                    />
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    isDisplay='hidden'
                    onCancel={ this._handleCancel } 
                    onSubmit={ this._handleSubmit.bind(this) } 
                    headerTitle={ formatMessage({id: "LANG3859"}) } 
                />
                { content }
            </div>
        )
    }
}

UserManage.propTypes = {
}

export default Form.create()(injectIntl(UserManage))
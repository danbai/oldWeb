'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import {injectIntl} from 'react-intl'
import React, { Component, PropTypes } from 'react'
import { Form, Input, Tabs, message, Modal } from 'antd'

import Cleaner from './cleaner'
import Cleanup from './cleanup'
import ResetReboot from './resetReboot'

const TabPane = Tabs.TabPane

class CleanReset extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isDisplay: "hidden",
            activeKey: this.props.params.id ? this.props.params.id : 'resetReboot',
            cleanerLoad: false
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    _handleCancel = () => {
        this.setState({
            cleanerLoad: true
        })
    }
    _handleSubmit = () => {
        // e.preventDefault()
        const { formatMessage } = this.props.intl
        const { form } = this.props

        // if ($P("#form", document).valid()) {
        //    message.loading(formatMessage({ id: "LANG904"}))
        // })

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                let all = values

                if (values.Pen_auto_clean_vr && !values.Pen_auto_clean_monitor && !values.Pen_auto_clean_meetme && !values.Pen_auto_clean_queue && !values.Pen_auto_clean_vm && !values.Pen_auto_clean_fax && !values.Pen_auto_clean_backup) {
                    Modal.warning({
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG3456"})}} ></span>,
                        okText: (formatMessage({id: "LANG727"}))
                    })
                } else {
                    let data = {
                        action: "setCleanerValue"
                    }

                    _.each(all, function(num, key) {
                        if (key === 'Phour_clean_cdr' || key === 'Pclean_cdr_interval' || key === 'Pclean_record_threshold' || key === 'Phour_clean_vr' || key === 'Pclean_record_interval') {
                            data[key] = num
                        } else {
                            data[key] = num ? "1" : "0"
                        }
                    })

                    $.ajax({
                        data: data,
                        type: 'post',
                        url: api.apiHost,
                        error: function(e) {
                            // message.error(e.statusText)
                        },
                        success: function(data) {
                            const bool = UCMGUI.errorHandler(data, null, formatMessage)
                            
                            if (bool) {
                                this._applyChanges()
                            }
                        }.bind(this)
                    })
                }
            }
        })
    }
    _applyChanges = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'GET',
            url: api.apiHost + 'action=reloadCrontabs&crontabjobs=',
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    message.success(formatMessage({ id: "LANG844"}))
                }
            }
        }).bind(this)
    }
    _onChange = (activeKey) => {
        if (activeKey === "cleaner") {
            this.setState({
                activeKey,
                isDisplay: "display-block"
            })
        } else {
            this.setState({
                activeKey,
                isDisplay: "hidden"
            })
        }
    }
    _setCleanerLoad = (e) => {
        this.setState({
            cleanerLoad: e
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG5302"})
                })
        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    onCancel={ this._handleCancel } 
                    isDisplay={ this.state.isDisplay }
                    onSubmit={ this._handleSubmit.bind(this) } 
                    headerTitle={ formatMessage({id: "LANG5302"}) } 
                />
                <Tabs
                    onChange={ this._onChange }
                    activeKey={ this.state.activeKey }
                    animated={ UCMGUI.initConfig.msie ? false : true }
                >
                    <TabPane tab={ formatMessage({id: "LANG649"}) } key="resetReboot">
                        <ResetReboot />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG643"}) } key="cleaner">
                        <Cleaner 
                            form={ this.props.form }
                            cleanerLoad={this.state.cleanerLoad}
                            setCleanerLoad={this._setCleanerLoad}
                        />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG5122"}) } key="cleanup">
                        <Cleanup />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

CleanReset.propTypes = {}

export default Form.create()(injectIntl(CleanReset))
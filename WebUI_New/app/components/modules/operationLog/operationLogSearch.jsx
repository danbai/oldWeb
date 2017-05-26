'use strict'

import React, { Component, PropTypes } from 'react'
import { Form, Input, Select, DatePicker, Button, Row, Col, Checkbox, Icon, message } from 'antd'
import { FormattedMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Validator from "../../api/validator"
import _ from 'underscore'

const FormItem = Form.Item

const CustomizedForm = injectIntl(Form.create({
    onFieldsChange(props, changedFields) {
        props.onChange(changedFields)
    }
})((props) => {
    const { formatMessage, formatHTMLMessage } = props.intl
    const { getFieldDecorator } = props.form

    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 12 }
    }

    const formItemLayoutCheckGroup = {
        labelCol: { span: 3 },
        wrapperCol: { span: 12 }
    }

    const Option = Select.Option

    const userLists = props.userLists

    return (
        <Form id="operationLog-form" className={ props.isDisplaySearch }>
            <Row>
                <Col span={12}>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>{formatMessage({id: "LANG1048"})}</span>
                        )}
                    >
                        {getFieldDecorator('start_date', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: props._checkTimeStart
                            }]
                        })(
                            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
                        )}
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>{formatMessage({id: "LANG1049"})}</span>
                        )}
                    >
                        {getFieldDecorator('end_date', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: props._checkTimeEnd
                            }]
                        })(
                            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
                        )}
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <FormItem
                        { ...formItemLayout }
                        label={formatMessage({id: "LANG5200"})} >
                        {getFieldDecorator('ipaddress')(
                            <Input />
                        )}
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                        { ...formItemLayout }
                        label={formatMessage({id: "LANG2809"})} >
                        {getFieldDecorator('user_name', {
                            rules: [],
                            initialValue: ""
                        })(
                            <Select>
                                {
                                   userLists.map(function(it) {
                                    const val = it.val
                                    const text = it.text

                                    return <Option key={ val } value={ val }>
                                           { text ? text : val }
                                        </Option>
                                    })
                               }
                            </Select>
                        )}
                    </FormItem>
                </Col>
            </Row>
            <div className="hide_search sprite sprite-slide-bar" onClick={ props._hideSearch }></div>
        </Form>
    )
}))

class OperLogUsrSearch extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount () {
    }
    _handleFormChange = (changedFields) => {
        _.extend(this.props.dataSource, changedFields)
    }
    _checkTimeStart = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const endValue = getFieldValue('end_date')

        if (value.valueOf() >= endValue.valueOf()) {
            callback(formatMessage({id: "LANG2165"}, {0: formatMessage({id: "LANG1049"}), 1: formatMessage({id: "LANG1048"})}))
        } else {
            callback()
        }
    }
    _checkTimeEnd = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const startValue = getFieldValue('start_date')

        if (value.valueOf() <= startValue.valueOf()) {
            callback(formatMessage({id: "LANG2142"}, {0: formatMessage({id: "LANG1049"}), 1: formatMessage({id: "LANG1048"})}))
        } else {
            callback()
        }
    }
    render() {
        let searchAction = this.props.dataSource
        let userLists = this.props.userLists || []

        return (
            <CustomizedForm
                userLists = { userLists }
                onChange={ this._handleFormChange.bind(this) } 
                dataSource={ searchAction }
                _hideSearch = { this.props._hideSearch } 
                isDisplaySearch={ this.props.isDisplaySearch }
                _checkTimeEnd = {this._checkTimeEnd}
                _checkTimeStart = {this._checkTimeStart}
            />
        )
    }
}

export default injectIntl(OperLogUsrSearch)
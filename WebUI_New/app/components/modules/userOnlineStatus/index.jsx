'use strict'

import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import { Form, Row, Col, Icon, Tooltip, message } from 'antd'
const FormItem = Form.Item

class Network extends Component {
    constructor(props) {
        super(props)
        this.state = {
            
        }
    }
    componentDidMount() {

    }
    componentWillUnmount() {

    }
    render() {
        const {formatMessage} = this.props.intl
        const { getFieldDecorator } = this.props.form

        return (
            <div className="app-content-main" id="app-content-main">
                <Form layout="horizontal">
                    <Row gutter={16}>
                        <Col sm={24}>
                            <FormItem>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG169" /> }>
                                    <span>{ formatMessage({id: "LANG169"}) }</span>
                                </Tooltip>
                                <span></span>
                            </FormItem>
                        </Col>
                        <Col sm={24}>
                            <FormItem>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG184" /> }>
                                    <span>{ formatMessage({id: "LANG184"}) }</span>
                                </Tooltip>
                                <span></span>
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}

module.exports = Form.create()(injectIntl(Network))
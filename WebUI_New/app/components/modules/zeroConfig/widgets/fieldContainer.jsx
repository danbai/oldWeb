'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Tabs, Collapse } from 'antd'
import _ from 'underscore'
import { createGUID, prepareLocalizedLabel, testVisibleCondition } from '../parser/ZCHelper'
import FieldGroup from './fieldGroup'
const FormItem = Form.Item
const Panel = Collapse.Panel

class FieldContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            options: {
                mode: props.mode ? props.mode : "all",
                factory: props.factory ? props.factory : null,
                deferred: props.deferred ? props.deferred : null,
                source: props.source ? props.source : [],
                expandFirst: props.expandFirst ? props.expandFirst : true
            }            
        }
    }
    componentWillReceiveProps(newProps) {
        this._initFieldContainer(newProps)
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    componentWillUnmount() {        
    }
    _initFieldContainer = options => {
        // const options = options // this.state.options
        Object.keys(options).forEach(name => {
            if (name === "source") {
                if (typeof options[name] === "function") {
                    options[name] = options[name].call()
                }
            }
        })

        this.setState({
            options: {
                mode: options.mode ? options.mode : "all",
                factory: options.factory ? options.factory : null,
                deferred: options.deferred ? options.deferred : null,
                source: options.source ? options.source : [],
                expandFirst: options.expandFirst ? options.expandFirst : true
            }            
        })
    }
    _handleSubmit = () => {
        const { formatMessage } = this.props.intl       
        console.log("weiling _handleSubmit")
    }
    _handleCancel = () => {
        const { formatMessage } = this.props.intl       
        console.log("weiling _handleCancel")
    }
    render() {
        const {formatMessage} = this.props.intl
        const mode = this.state.options.mode,
              deferred = this.state.options.deferred,
              factory = this.state.options.factory,
              source = this.state.options.source
        return (
            <Collapse defaultActiveKey={['0']}>
                {source.map((fieldGroup, i) => {
                        let label = fieldGroup.label ? prepareLocalizedLabel(fieldGroup.label) : "unknown"              
                        if (testVisibleCondition(fieldGroup)) {
                           return (
                                <Panel header={formatMessage({id: label})}
                                       key={i}>
                                    <FieldGroup block={fieldGroup}
                                            factory={factory}
                                            deferred={deferred}
                                            mode={mode} 
                                            key={i}/>
                                </Panel> 
                            ) 
                       } else {
                            return
                       }
                    }                                       
                )}
            </Collapse>
        )
    }
}

FieldContainer.propTypes = {
}

export default injectIntl(FieldContainer)
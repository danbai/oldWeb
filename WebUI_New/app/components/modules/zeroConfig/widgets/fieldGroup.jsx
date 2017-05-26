'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Tabs, Collapse } from 'antd'
import _ from 'underscore'
import { createGUID, pad, prepareLocalizedLabel, testVisibleCondition } from '../parser/ZCHelper'
import FieldSubGroup from './fieldSubGroup'
const FormItem = Form.Item
const Panel = Collapse.Panel

class FieldGroup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            index: props.index ? props.index : 0,
            options: {
                mode: props.mode ? props.mode : "all",
                factory: props.factory ? props.factory : null,
                deferred: props.deferred ? props.deferred : null,
                block: props.block ? props.block : {},
                defaultExpanded: props.defaultExpanded ? props.defaultExpanded : false
            }            
        }
    }
    componentWillReceiveProps(newProps) {
        // TODO:
        this._initFieldGroup(newProps)
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    componentWillUnmount() {        
    }
    _initFieldGroup = options => {
        Object.keys(options).forEach(name => {
            if (name === "block") {
                if (typeof options[name] === "function") {
                    options[name] = options[name].call()
                }
            }
        })

        this.setState({
            index: options.index,
            options: {
                mode: options.mode ? options.mode : "all",
                factory: options.factory ? options.factory : null,
                deferred: options.deferred ? options.deferred : null,
                block: options.block ? options.block : {},
                defaultExpanded: options.defaultExpanded ? options.defaultExpanded : false
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
        const index = this.state.index,
              mode = this.state.options.mode,
              deferred = this.state.options.deferred,
              factory = this.state.options.factory,
              block = this.state.options.block,
              blockElements = block.items
              
        return (
            <Collapse className="field-group"
                      id={block._uuid}
                      itemID={pad(block.id, 8)}>  
                {blockElements.map((fieldSubGroup, i) => {
                        let label = fieldSubGroup.label ? prepareLocalizedLabel(fieldSubGroup.label) : "unknown"              
                        if (testVisibleCondition(fieldSubGroup)) {
                            return (
                                <Panel header={formatMessage({id: label})}
                                       key={i}>
                                    <FieldSubGroup blockElement={fieldSubGroup}
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

FieldGroup.propTypes = {
}

export default injectIntl(FieldGroup)
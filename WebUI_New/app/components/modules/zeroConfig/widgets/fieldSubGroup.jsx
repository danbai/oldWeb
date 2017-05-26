'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Tabs, Collapse } from 'antd'
import _ from 'underscore'
import { createGUID, prepareLocalizedLabel, testVisibleCondition } from '../parser/ZCHelper'
import FieldItem from './fieldItem'
const FormItem = Form.Item
const Panel = Collapse.Panel

class FieldSubGroup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            options: {
                mode: props.mode ? props.mode : "all",
                factory: props.factory ? props.factory : null,
                deferred: props.deferred ? props.deferred : null,
                blockElement: props.blockElement ? props.blockElement : {}
            }            
        }
    }
    componentWillReceiveProps(newProps) {
        // TODO:
        this._initFieldSubGroup(newProps)
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    componentWillUnmount() {        
    }
    _initFieldSubGroup = options => {
        Object.keys(options).forEach(name => {
            if (name === "blockElement") {
                if (typeof options[name] === "function") {
                    options[name] = options[name].call()
                }
            }
        })

        if (!options.blockElement._uuid) {
            options.blockElement._uuid = createGUID()
        }

        this.setState({
            options: {
                mode: options.mode ? options.mode : "all",
                factory: options.factory ? options.factory : null,
                deferred: options.deferred ? options.deferred : null,
                blockElement: options.blockElement ? options.blockElement : {},
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
              blockElement = this.state.options.blockElement,
              elements = blockElement.items

        return (
            <Collapse className="field-subgroup"
                      id={blockElement._uuid} 
                      defaultActiveKey={['0']}>
                {elements.map((fieldItem, i) => {
                        let label = fieldItem.label ? prepareLocalizedLabel(fieldItem.label) : "unknown"              
                        if (testVisibleCondition(fieldItem)) {
                            return (
                                <Panel header={formatMessage({id: label})}
                                       key={i}>
                                    <FieldItem element={fieldItem}
                                               factory={factory}
                                               deferred={deferred}
                                               mode={mode} />
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

FieldSubGroup.propTypes = {
}

export default injectIntl(FieldSubGroup)
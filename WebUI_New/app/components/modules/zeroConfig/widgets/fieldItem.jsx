'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Tabs, Panel } from 'antd'
import _ from 'underscore'
import { createGUID, pad, prepareLocalizedLabel } from '../parser/ZCHelper'
const FormItem = Form.Item

class FieldItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            index: props.index ? props.index : 0,
            options: {
                mode: props.mode ? props.mode : "all",
                factory: props.factory ? props.factory : null,
                deferred: props.deferred ? props.deferred : null,
                element: props.element ? props.element : {},
                tooltip: props.tooltip ? props.tooltip : "qtip"
            }            
        }
    }
    componentWillReceiveProps(newProps) {
        // TODO:
        this._initFieldItem(newProps)
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    componentWillUnmount() {        
    }
    _initFieldItem = options => {
        Object.keys(options).forEach(name => {
            if (name === "element") {
                if (typeof options[name] === "function") {
                    options[name] = options[name].call()
                }
                this._createContent(options[name])
            }
        })

        if (!options.element._uuid) {
            options.element._uuid = createGUID()
        }

        this.setState({
            index: options.index,
            options: {
                mode: options.mode ? options.mode : "all",
                factory: options.factory ? options.factory : null,
                deferred: options.deferred ? options.deferred : null,
                element: options.element ? options.element : {},
                defaultExpanded: options.defaultExpanded ? options.defaultExpanded : false
            }            
        })
    }
    _createContent = element => {

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
              element = this.state.options.element,
              label = element.label ? prepareLocalizedLabel(element.label) : "unknown"
        return (
            <div className="field"
                 id={element._uuid}
                 itemID={`${pad(element.id, 8)}.${pad((element.elementNum ? element.elementNum : 1), 3)}`}
                 key={index}>
                <p> 
                   {formatMessage({id: label})}
                </p>
            </div>
        )
    }
}

FieldItem.propTypes = {
}

export default injectIntl(FieldItem)
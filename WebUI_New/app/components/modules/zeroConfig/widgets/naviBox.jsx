'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Tabs } from 'antd'
import _ from 'underscore'
import { createGUID } from '../parser/ZCHelper'
import FieldContainer from './fieldContainer'
const FormItem = Form.Item

class NaviBox extends Component {
    constructor(props) {
        super(props)
        this.state = {
            options: {
                mode: props.mode ? props.mode : "all",
                factory: props.factory ? props.factory : null,
                deferred: props.deferred ? props.deferred : null,
                source: props.source ? props.source : []
            }            
        }
    }
    componentWillReceiveProps(newProps) {
        // TODO:
        this._initNaviBox(newProps)
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    componentWillUnmount() {        
    }
    _initNaviBox = options => {
        Object.keys(options).forEach(name => {
            if (name === "source") {
                for (let block of options[name]) {
                    this._initItemProperty(block, 0)
                }
            }
        })

        this.setState({
            options: {
                mode: options.mode ? options.mode : "all",
                factory: options.factory ? options.factory : null,
                deferred: options.deferred ? options.deferred : null,
                source: options.source ? options.source : []
            }            
        })
    }
    _initItemProperty = (item, lv) => {
        if (!item._uuid) {
            item._uuid = createGUID()
            item._level = lv
        }

        if (item.items) {
            for (let childItems of item.items) {
                childItems._parent = item
                this._initItemProperty(childItems, lv + 1)
            }
        }
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
            <div>
                <div id="navBar">
                    <div id="navBar-inner">
                        <div className="ucm-navibox">
                            {mode !== "all" &&
                                <Button
                                    type="primary"
                                    size="default">
                                    { formatMessage({id: "LANG3539"}) }
                                </Button>
                            }
                        </div>
                    </div>
                </div>
                <div id="itemContainer"
                     className="field-container">
                    <FieldContainer mode={mode}
                                deferred={deferred}
                                factory={factory}
                                source={source}/>
                </div>
            </div>
        )
    }
}

NaviBox.propTypes = {
}

export default injectIntl(NaviBox)
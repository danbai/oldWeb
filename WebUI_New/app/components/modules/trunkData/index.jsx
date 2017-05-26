'use strict'

import React, { Component, PropTypes } from 'react'
import { Form, Input, Icon, Button, Table, Select } from 'antd'
import {injectIntl} from 'react-intl'
import Title from '../../../views/title'
import DataTrunksList from './dataTrunksList'
import { browserHistory } from 'react-router'

class DataTrunk extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {

    }
    onChange(activeKey) {
        if (activeKey === "1") {

        } else {            
            
        }
    }
    render() {
        const {formatMessage} = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 
            1: formatMessage({id: "LANG3573"})
        })

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <div className="lite-desc">
                        { formatMessage({id: "LANG3574"}) }
                    </div>
                    { <DataTrunksList /> }
                </div>
            </div>
        )
    }
}

DataTrunk.propTypes = {
}

module.exports = injectIntl(DataTrunk)

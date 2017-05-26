'use strict'

import React, { Component, PropTypes } from 'react'
import { Form, Input, Icon, Button, Table, Select } from 'antd'
import {injectIntl} from 'react-intl'
import Title from '../../../views/title'
import VoipTrunksList from './voipTrunksList'
import { browserHistory } from 'react-router'

class VoipTrunk extends Component {
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
        
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 
            1: formatMessage({id: "LANG641"})
        })

        return (
            <div className="app-content-main" id="app-content-main">
                <Title 
                    headerTitle={ formatMessage({id: "LANG641"}) }  
                    isDisplay='hidden' 
                />
                <VoipTrunksList />
            </div>
        )
    }
}

VoipTrunk.propTypes = {
}

module.exports = injectIntl(VoipTrunk)
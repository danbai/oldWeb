'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Radio } from 'antd'
import AnalogRecord from './analogRecord'
import AnalogFxo from './analogFxo'

const RadioGroup = Radio.Group

class Analog extends Component {
    constructor(props) {
        super(props)
        const { formatMessage } = this.props.intl
        this.state = {
            isDisplay: '1',
            radioChecked: '1'
        }
    }
    componentDidMount = () => {

    }
    _radioChange = (e) => {
        this.setState({
            isDisplay: e.target.value,
            radioChecked: e.target.value
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        return (
            <div className="content">
                <div className="top-button">
                    <RadioGroup onChange={ this._radioChange } value={ this.state.radioChecked }>
                        <Radio value="1">{ formatMessage({id: 'LANG3238'}) }</Radio>
                        <Radio value="2">{ formatMessage({id: 'LANG5082'}) }</Radio>
                    </RadioGroup>
                </div>
                <div className={ this.state.isDisplay === '1' ? 'display-block' : 'hidden' }>
                    <AnalogRecord />
                </div>
                <div className={ this.state.isDisplay === '2' ? 'display-block' : 'hidden' }>
                    <AnalogFxo />
                </div>
            </div>
        )
    }
}

export default injectIntl(Analog)
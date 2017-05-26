'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Form, Input, message, Tabs } from 'antd'

import $ from 'jquery'
import api from "../../api/api"
import '../../../css/conference'
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import Room from './room'
import Schedule from './schedule'
import GoogleSettings from './googleSettings'
import ConferenceRecord from './conferenceRecord'

const TabPane = Tabs.TabPane

class Conference extends Component {
    constructor(props) {
        super(props)

        this.state = {
            activeKey: this.props.params.jumpId ? this.props.params.jumpId : '1'
        }
    }
    _onChange = (e) => {
        this.setState({
            activeKey: e
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG18"})
                })

        return (
            <div className="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG18"}) } isDisplay='hidden' />
                <Tabs
                    defaultActiveKey='1'
                    onChange={ this._onChange }
                    activeKey={ this.state.activeKey }
                    animated={ UCMGUI.initConfig.msie ? false : true }
                >
                    <TabPane tab={ formatMessage({id: "LANG18"}) } key="1">
                        <Room />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG3775"}) } key="2">
                        <Schedule />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG3513"}) } key="3">
                        <GoogleSettings />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG2241"}) } key="4">
                        <ConferenceRecord
                            activeKey={ this.state.activeKey }
                        />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

export default Form.create()(injectIntl(Conference))
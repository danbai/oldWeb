'use strict'

import React, { Component, PropTypes } from 'react'
import { message, Tabs } from 'antd'
import { FormattedMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import _ from 'underscore'
import Title from '../../../views/title'
import EnternetCapture from './ethernetCapture'
import IpPing from './ipPing'
import Traceroute from './traceroute'
import '../../../css/troubleShooting'

const TabPane = Tabs.TabPane

class NetTroubleshooting extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount () {
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 
            1: formatMessage({id: "LANG5461"})
        })

        return (
            <div className="app-content-main">
                <Title 
                    headerTitle={ formatMessage({id: "LANG5461"}) }
                    isDisplay='hidden' />
                <Tabs
                    defaultActiveKey="1"
                    animated={ UCMGUI.initConfig.msie ? false : true }
                >
                    <TabPane tab={ formatMessage({id: "LANG69"}) } key="1">
                        <EnternetCapture/>
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG70"}) } key="2">
                        <IpPing/>
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG71"}) } key="3">
                        <Traceroute/>
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

export default injectIntl(NetTroubleshooting)
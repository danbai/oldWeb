'use strict'

import React, { Component, PropTypes } from 'react'
import { message, Tabs } from 'antd'
import { FormattedMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import _ from 'underscore'
import Title from '../../../views/title'
import PriSignal from './priSignal'
import Ss7Signal from './ss7Signal'
import MfcSignal from './mfcSignal'
import Analog from './analog'
import Digital from './digital'
import '../../../css/troubleShooting'

const TabPane = Tabs.TabPane

class SignalTroubleshooting extends Component {
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
            1: formatMessage({id: "LANG5462"})
        })

        let tabPane

        if (model_info.model_name === 'UCM6510') {
            tabPane = <Tabs
                            defaultActiveKey="1"
                            animated={ UCMGUI.initConfig.msie ? false : true }
                        >
                        <TabPane tab={ formatMessage({id: "LANG2788"}) } key="1">
                            <PriSignal/>
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG3264"}) } key="2">
                            <Ss7Signal/>
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG3252"}) } key="3">
                            <MfcSignal/>
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG3238"}) } key="4">
                            <Analog/>
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG4023"}) } key="5">
                            <Digital/>
                        </TabPane>
                    </Tabs>
        } else {
            tabPane = <Tabs
                        defaultActiveKey="1"
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG3238"}) } key="1">
                            <Analog/>
                        </TabPane>
                    </Tabs>
        }

        return (
            <div className="app-content-main">
                <Title 
                    headerTitle={ formatMessage({id: "LANG5462"}) }
                    isDisplay='hidden' />
                    { tabPane }
            </div>
        )
    }
}

export default injectIntl(SignalTroubleshooting)
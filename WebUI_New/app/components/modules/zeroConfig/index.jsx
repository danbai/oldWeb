'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { Tabs, message } from 'antd'
import {injectIntl} from 'react-intl'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'

import Devices from './devices'
import GlobalPolicy from './globalPolicy'
import ModelTemplates from './modelTemplates'
import GlobalTemplates from './globalTemplates'
import TemplateManagement from './templateManagement'
import ZeroConfigSettings from './zeroConfigSettings'
// import ZEROCONFIG from './parser/ZCDataSource'

import '../../../css/zc.less'

const TabPane = Tabs.TabPane

class ZeroConfig extends Component {
    constructor(props) {
        super(props)

        this.state = {}
    }
    componentDidMount() {
        // ZEROCONFIG.init()
    }
    componentWillUnmount() {

    }
    onChange(activeKey) {
        browserHistory.push('/value-added-features/zeroConfig/' + activeKey)
    }
    _handleCancel = () => {
    }
    _handleSubmit = () => {
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        let activeKey = this.props.params.tab
        let filter = this.props.route.path === 'devices/res' ? 'res' : 'all'
        let tabList = ['devices', 'globalPolicy', 'globalTemplates', 'modelTemplates', 'templateManagement', 'settings']

        if (_.indexOf(tabList, activeKey) === -1) {
            activeKey = 'devices'
        }

        document.title = formatMessage({
                    id: "LANG584"
                }, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG16"})
                })

        return (
            <div className="app-content-main app-content-main-zeroconfig" id="app-content-main">
                <Title
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='hidden'
                    headerTitle={ formatMessage({id: "LANG16"}) }
                />
                <Tabs
                    activeKey={ activeKey }
                    onChange={ this.onChange }
                    animated={ UCMGUI.initConfig.msie ? false : true }
                >
                    <TabPane tab={ formatMessage({id: "LANG16"}) } key="devices">
                        <Devices
                            filter={ filter }
                            activeKey={ activeKey }
                        />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG3169"}) } key="globalPolicy">
                        <GlobalPolicy
                            activeKey={ activeKey }
                        />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG3444"}) } key="globalTemplates">
                        <GlobalTemplates
                            activeKey={ activeKey }
                        />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG3445"}) } key="modelTemplates">
                        <ModelTemplates
                            activeKey={ activeKey }
                        />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG3980"}) } key="templateManagement">
                        <TemplateManagement
                            activeKey={ activeKey }
                        />
                    </TabPane>
                    <TabPane tab={ formatMessage({id: "LANG3904"}) } key="settings">
                        <ZeroConfigSettings
                            activeKey={ activeKey }
                        />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

ZeroConfig.propTypes = {
}

export default injectIntl(ZeroConfig)

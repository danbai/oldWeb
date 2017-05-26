'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import { message, Tabs } from 'antd'
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import SwitchBoardItem from './switchboardItem'

const TabPane = Tabs.TabPane

class SwitchBoard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            activeTabKey: '',
            queueMembers: [],
            callQueueList: [],
            answerCallings: [],
            waitingCallings: []
        }
    }
    componentWillMount () {
        // this._getQueueByChairman()
        this.props.getCallQueuesMessage()
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/callQueue')
    }
    _onTabsChange = (activeTabKey) => {
        this.setState({ activeTabKey })

        this.props.getCallQueuesMemberMessage(activeTabKey)
        this.props.getQueueCallingAnswered(activeTabKey)
        this.props.getQueueCallingWaiting(activeTabKey)
    }
    render() {
        const { formatMessage } = this.props.intl
        const queueMembers = this.props.queueMembers
        const callQueueList = this.props.callQueueList
        const answerCallings = this.props.answerCallings
        const waitingCallings = this.props.waitingCallings
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const activeTabKey = (callQueueList && callQueueList.length ? callQueueList[0].extension : '')

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG5407"})
                })

        return (
            <div className="app-content-main app-content-cdr">
                <Title
                    isDisplay='display-block'
                    isDisplaySubmit="hidden"
                    onCancel={ this._handleCancel }
                    headerTitle={ formatMessage({id: "LANG5407"}) }
                />
                <Tabs
                    onChange={ this._onTabsChange }
                    activeKey={ this.state.activeTabKey ? this.state.activeTabKey : activeTabKey }
                    animated={ UCMGUI.initConfig.msie ? false : true }
                >
                {
                    callQueueList.map(function(item) {
                        return <TabPane
                                    key={ item.extension }
                                    tab={ item.extension + (item.queuename ? (' (' + item.queuename + ')') : '') }
                                >
                                    <SwitchBoardItem
                                        queueDetail={ item }
                                        queueMembers={ queueMembers }
                                        answerCallings={ answerCallings }
                                        waitingCallings={ waitingCallings }
                                    />
                                </TabPane>
                    })
                }
                </Tabs>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    queueMembers: state.queueMembers,
    callQueueList: state.callQueueList,
    answerCallings: state.answerCallings,
    waitingCallings: state.waitingCallings
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(SwitchBoard))
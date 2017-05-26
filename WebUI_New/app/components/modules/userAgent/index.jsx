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

import SwitchBoardItem from './item'

const TabPane = Tabs.TabPane

class SwitchBoard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            activeTabKey: '',
            queueMembers: [],
            callQueueList: [],
            answerCallings: [],
            waitingCallings: [],
            currentUserName: localStorage.getItem('username')
        }
    }
    componentWillMount () {
        this.props.getCallQueuesMessage(this.state.currentUserName)
    }
    _onTabsChange = (activeTabKey) => {
        this.setState({ activeTabKey })

        this.props.getCallQueuesMemberMessage(activeTabKey, this.state.currentUserName)
        this.props.getQueueCallingAnswered(activeTabKey, this.state.currentUserName)
        this.props.getQueueCallingWaiting(activeTabKey, this.state.currentUserName)
    }
    render() {
        let { formatMessage } = this.props.intl
        let queueMembers = this.props.queueMembers
        let callQueueList = this.props.callQueueList
        let answerCallings = this.props.answerCallings
        let queueMemberRole = this.props.queueMemberRole
        let waitingCallings = this.props.waitingCallings
        let activeTabKey = (callQueueList && callQueueList.length ? callQueueList[0].extension : '')

        document.title = formatMessage({id: "LANG584"}, {
                    0: formatMessage({id: "LANG82"}),
                    1: formatMessage({id: "LANG5407"})
                })

        let content = <SwitchBoardItem
                        queueDetail={ {} }
                        queueMembers={ queueMembers }
                        answerCallings={ answerCallings }
                        waitingCallings={ waitingCallings }
                    />

        if (activeTabKey && queueMemberRole !== 'extension') {
            content = <Tabs
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
                                            queueMemberRole={ queueMemberRole }
                                            waitingCallings={ waitingCallings }
                                        />
                                    </TabPane>
                        })
                    }
                    </Tabs>
        }

        return (
            <div className="app-content-main app-content-cdr">
                <Title
                    headerTitle={ formatMessage({id: "LANG24"}) }
                    isDisplay='hidden'
                />
                { content }
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    queueMembers: state.queueMembers,
    callQueueList: state.callQueueList,
    answerCallings: state.answerCallings,
    queueMemberRole: state.queueMemberRole,
    waitingCallings: state.waitingCallings
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(SwitchBoard))